#![deny(clippy::all)]

use merman::svg::{RootBackgroundPostprocessor, ScopedCssPostprocessor, SvgPipeline};
use merman::svg::{ThemeAdmissionPolicy, TrustedThemeLane, TrustedThemeLanes};
use merman::{
  MermaidEngine, OperationControl, ParseOptions, RenderOutput, RenderRequest, Renderer,
  SourcePresentationConfig, SvgRequest,
};
use napi_derive::napi;
use serde_json::Value;
use std::sync::atomic::{AtomicU64, Ordering};

static NEXT_ID: AtomicU64 = AtomicU64::new(0);

/// Internal transport options. TypeScript translates legacy option names.
#[napi(object)]
pub struct RenderOptions {
  pub site_config_json: Option<String>,
  pub diagram_id: Option<String>,
  pub scoped_css: Option<String>,
  pub fast_text_metrics: Option<bool>,
  pub viewport_width: Option<f64>,
  pub viewport_height: Option<f64>,
}

#[napi]
pub fn supported_diagrams() -> Vec<String> {
  merman::supported_diagrams()
    .iter()
    .map(|name| (*name).to_owned())
    .collect()
}

/// Synchronous SVG rendering via the published Merman Rust facade.
#[napi]
pub fn render(code: String, opts: Option<RenderOptions>) -> napi::Result<String> {
  std::panic::catch_unwind(|| render_inner(code, opts))
    .unwrap_or_else(|_| Err(napi::Error::from_reason("Merman renderer panicked")))
}

fn render_inner(code: String, opts: Option<RenderOptions>) -> napi::Result<String> {
  let id = format!(
    "satteri-mermaid-{}",
    NEXT_ID.fetch_add(1, Ordering::Relaxed)
  );
  let renderer = Renderer::new().with_parse_options(ParseOptions::strict());
  // Native SVG text avoids browser-only foreignObject labels and duplicate fallbacks.
  let mut config =
    serde_json::json!({"theme": "default", "htmlLabels": false, "securityLevel": "strict"});
  let mut request = SvgRequest::default();
  request.environment = request.environment.with_theme_admission_policy(
    ThemeAdmissionPolicy::permissive().with_trusted_lanes(TrustedThemeLanes::from_allowed([
      TrustedThemeLane::RawThemeCss,
    ])),
  );
  request.options.diagram_id = Some(id);
  request.pipeline = Some(SvgPipeline::parity());
  if let Some(opts) = opts {
    if let Some(json) = opts.site_config_json {
      let supplied: Value = serde_json::from_str(&json)
        .map_err(|error| napi::Error::from_reason(format!("Invalid Merman siteConfig: {error}")))?;
      let supplied = supplied
        .as_object()
        .ok_or_else(|| napi::Error::from_reason("Merman siteConfig must be an object"))?;
      config
        .as_object_mut()
        .expect("object literal")
        .extend(supplied.clone());
    }
    if let Some(id) = opts.diagram_id {
      request.options.diagram_id = Some(id);
    }
    // Merman 0.10 uses deterministic text metrics by default.
    for (value, name) in [
      (opts.viewport_width, "viewportWidth"),
      (opts.viewport_height, "viewportHeight"),
    ] {
      if let Some(value) = value {
        if !value.is_finite() || value <= 0.0 {
          return Err(napi::Error::from_reason(format!(
            "{name} must be a finite positive number"
          )));
        }
        if name == "viewportWidth" {
          request.layout.container_width = value;
        } else {
          request.layout.container_height = value;
        }
      }
    }
    if let Some(css) = opts.scoped_css {
      request.pipeline = Some(
        request
          .pipeline
          .take()
          .unwrap_or_else(SvgPipeline::parity)
          .with_postprocessor(ScopedCssPostprocessor::new(css)),
      );
    }
  }
  let theme_variables = config
    .as_object_mut()
    .expect("object literal")
    .entry("themeVariables")
    .or_insert_with(|| serde_json::json!({}));
  if let Some(theme_variables) = theme_variables.as_object_mut() {
    // Merman 0.10 currently emits NaN for the Quadrant Chart point fill default.
    theme_variables
      .entry("quadrantPointFill")
      .or_insert_with(|| Value::String("#1f77b4".to_owned()));
  }
  if let Some(background) = config
    .pointer("/themeVariables/background")
    .and_then(Value::as_str)
  {
    request.pipeline = Some(
      request
        .pipeline
        .take()
        .unwrap_or_else(SvgPipeline::parity)
        .with_postprocessor(RootBackgroundPostprocessor::new(background)),
    );
  }
  let renderer = renderer.with_presentation_engine(
    MermaidEngine::new().with_site_config(SourcePresentationConfig::from_value(config)),
  );
  let output = renderer
    .render(RenderRequest::svg(&code, OperationControl::new(), request))
    .map_err(|error| napi::Error::from_reason(format!("Merman render failed: {error}")))?;
  let RenderOutput::Svg(Some(svg)) = output else {
    return Err(napi::Error::from_reason(
      "Merman did not detect a Mermaid diagram",
    ));
  };
  Ok(svg.svg().to_owned())
}

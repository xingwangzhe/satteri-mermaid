#![deny(clippy::all)]

use merman::render::{
  HeadlessRenderer, RootBackgroundPostprocessor, ScopedCssPostprocessor, SvgPipeline,
};
use merman::MermaidConfig;
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
  let id = format!(
    "satteri-mermaid-{}",
    NEXT_ID.fetch_add(1, Ordering::Relaxed)
  );
  let mut renderer = HeadlessRenderer::new()
    .with_strict_parsing()
    .with_diagram_id(&id);
  // Native SVG text avoids browser-only foreignObject labels and duplicate fallbacks.
  let mut config =
    serde_json::json!({"theme": "default", "htmlLabels": false, "securityLevel": "strict"});
  let mut pipeline = SvgPipeline::parity();
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
      renderer = renderer.with_diagram_id(&id);
    }
    if opts.fast_text_metrics == Some(true) {
      renderer = renderer.with_deterministic_text_measurer();
    }
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
          renderer.layout.viewport_width = value;
        } else {
          renderer.layout.viewport_height = value;
        }
      }
    }
    if let Some(css) = opts.scoped_css {
      pipeline = pipeline.with_postprocessor(ScopedCssPostprocessor::new(css));
    }
  }
  if let Some(background) = config
    .pointer("/themeVariables/background")
    .and_then(Value::as_str)
  {
    pipeline = pipeline.with_postprocessor(RootBackgroundPostprocessor::new(background));
  }
  renderer
    .with_site_config(MermaidConfig::from_value(config))
    .with_svg_pipeline(pipeline)
    .render_svg_sync(&code)
    .map_err(|error| napi::Error::from_reason(format!("Merman render failed: {error}")))?
    .ok_or_else(|| napi::Error::from_reason("Merman did not detect a Mermaid diagram"))
}

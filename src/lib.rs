#![deny(clippy::all)]

use mermaid_rs_renderer::{RenderOptions as MrRenderOptions, Theme, render_with_options};
use napi_derive::napi;

#[napi(object)]
pub struct RenderOptions {
  /// Theme preset: "dark" | "modern" | "default" | "forest" | "neutral"
  pub theme: Option<String>,

  // ── typography ─────────────────────────────────────────────────
  pub font_family: Option<String>,
  pub font_size: Option<f64>,

  // ── colors: nodes & edges ──────────────────────────────────────
  /// Node fill color (old: `surface`)
  pub primary_color: Option<String>,
  /// Node border color (old: `border`)
  pub primary_border_color: Option<String>,
  /// Primary label / text color (old: `text`)
  pub primary_text_color: Option<String>,
  /// Edge / connector line color (old: `line`)
  pub line_color: Option<String>,

  // ── colors: canvas ─────────────────────────────────────────────
  /// Canvas background color (old: `canvas`)
  pub background: Option<String>,

  // ── colors: secondary surfaces ─────────────────────────────────
  /// Alt surface fill (old: `surface_alt`)
  pub secondary_color: Option<String>,
  /// Muted surface fill (old: `surface_muted`)
  pub tertiary_color: Option<String>,
  /// Secondary text / edge label color (old: `subtle_text`)
  pub text_color: Option<String>,

  // ── colors: subgraph / cluster ─────────────────────────────────
  /// Subgraph background (old: `cluster_background`)
  pub cluster_background: Option<String>,
  /// Subgraph border (old: `cluster_border`)
  pub cluster_border: Option<String>,

  // ── colors: edge labels ────────────────────────────────────────
  /// Edge label background (old: `edge_label_background`)
  pub edge_label_background: Option<String>,

  // ── colors: sequence diagram ───────────────────────────────────
  /// Sequence actor fill (old: `actor_background`)
  pub sequence_actor_fill: Option<String>,
  /// Sequence actor border (old: `actor_border`)
  pub sequence_actor_border: Option<String>,
  /// Sequence actor line
  pub sequence_actor_line: Option<String>,
  /// Sequence note fill (old: `note_background`)
  pub sequence_note_fill: Option<String>,
  /// Sequence note border (old: `note_border`)
  pub sequence_note_border: Option<String>,
  /// Sequence activation fill (old: `activation_background`)
  pub sequence_activation_fill: Option<String>,
  /// Sequence activation border (old: `activation_border`)
  pub sequence_activation_border: Option<String>,

  // ── git graph colors (8 slots) ───────────────────────────────
  pub git0: Option<String>,
  pub git1: Option<String>,
  pub git2: Option<String>,
  pub git3: Option<String>,
  pub git4: Option<String>,
  pub git5: Option<String>,
  pub git6: Option<String>,
  pub git7: Option<String>,
  pub git_inv0: Option<String>,
  pub git_inv1: Option<String>,
  pub git_inv2: Option<String>,
  pub git_inv3: Option<String>,
  pub git_inv4: Option<String>,
  pub git_inv5: Option<String>,
  pub git_inv6: Option<String>,
  pub git_inv7: Option<String>,
  pub git_branch_label0: Option<String>,
  pub git_branch_label1: Option<String>,
  pub git_branch_label2: Option<String>,
  pub git_branch_label3: Option<String>,
  pub git_branch_label4: Option<String>,
  pub git_branch_label5: Option<String>,
  pub git_branch_label6: Option<String>,
  pub git_branch_label7: Option<String>,
  pub git_commit_label_color: Option<String>,
  pub git_commit_label_background: Option<String>,
  pub git_tag_label_color: Option<String>,
  pub git_tag_label_background: Option<String>,
  pub git_tag_label_border: Option<String>,

  // ── pie chart colors (12 slices) & styling ──────────────────
  pub pie1: Option<String>,
  pub pie2: Option<String>,
  pub pie3: Option<String>,
  pub pie4: Option<String>,
  pub pie5: Option<String>,
  pub pie6: Option<String>,
  pub pie7: Option<String>,
  pub pie8: Option<String>,
  pub pie9: Option<String>,
  pub pie10: Option<String>,
  pub pie11: Option<String>,
  pub pie12: Option<String>,
  pub pie_title_text_size: Option<f64>,
  pub pie_title_text_color: Option<String>,
  pub pie_section_text_size: Option<f64>,
  pub pie_section_text_color: Option<String>,
  pub pie_legend_text_size: Option<f64>,
  pub pie_legend_text_color: Option<String>,
  pub pie_stroke_color: Option<String>,
  pub pie_stroke_width: Option<f64>,
  pub pie_outer_stroke_width: Option<f64>,
  pub pie_outer_stroke_color: Option<String>,
  pub pie_opacity: Option<f64>,

  // ── layout ─────────────────────────────────────────────────────
  pub node_spacing: Option<f64>,
  pub rank_spacing: Option<f64>,

  // ── render ─────────────────────────────────────────────────────
  /// Preferred output aspect ratio (e.g. 1.778 for 16:9)
  pub preferred_aspect_ratio: Option<f64>,
  /// Use fast (approximate) text metrics for speed
  pub fast_text_metrics: Option<bool>,
}

/// Render a Mermaid diagram to SVG string.
///
/// # Example
///
/// ```js
/// const svg = render('graph TD\n    A-->B', {
///     theme: 'dark',
///     primary_border_color: '#ff6600',
///     font_size: 14,
/// })
/// ```
#[napi]
pub fn render(code: String, opts: Option<RenderOptions>) -> napi::Result<String> {
  let mr_opts = build_render_options(&opts);
  render_with_options(&code, mr_opts).map_err(|e| napi::Error::from_reason(e.to_string()))
}

fn build_render_options(opts: &Option<RenderOptions>) -> MrRenderOptions {
  let opts = match opts {
    Some(o) => o,
    None => return MrRenderOptions::modern(),
  };

  let mut mr_opts = MrRenderOptions::modern();

  // Apply theme preset (case-insensitive)
  if let Some(ref name) = opts.theme {
    if let Some(preset) = Theme::from_name(name) {
      mr_opts.theme = preset;
    }
  }

  // ── typography ─────────────────────────────────────────────────
  if let Some(ref v) = opts.font_family { mr_opts.theme.font_family = v.clone(); }
  if let Some(v) = opts.font_size { mr_opts.theme.font_size = v as f32; }

  // ── theme colors ────────────────────────────────────────────────
  macro_rules! apply_theme {
    ($field:ident) => {
      if let Some(ref v) = opts.$field {
        mr_opts.theme.$field = v.clone();
      }
    };
  }

  apply_theme!(primary_color);
  apply_theme!(primary_border_color);
  apply_theme!(primary_text_color);
  apply_theme!(line_color);
  apply_theme!(background);
  apply_theme!(secondary_color);
  apply_theme!(tertiary_color);
  apply_theme!(text_color);
  apply_theme!(cluster_background);
  apply_theme!(cluster_border);
  apply_theme!(edge_label_background);
  apply_theme!(sequence_actor_fill);
  apply_theme!(sequence_actor_border);
  apply_theme!(sequence_actor_line);
  apply_theme!(sequence_note_fill);
  apply_theme!(sequence_note_border);
  apply_theme!(sequence_activation_fill);
  apply_theme!(sequence_activation_border);

  // ── git colors ─────────────────────────────────────────────────
  macro_rules! apply_git {
    ($idx:literal, $field:ident) => {
      if let Some(ref v) = opts.$field {
        mr_opts.theme.git_colors[$idx] = v.clone();
      }
    };
  }
  macro_rules! apply_git_inv {
    ($idx:literal, $field:ident) => {
      if let Some(ref v) = opts.$field {
        mr_opts.theme.git_inv_colors[$idx] = v.clone();
      }
    };
  }
  macro_rules! apply_git_branch_label {
    ($idx:literal, $field:ident) => {
      if let Some(ref v) = opts.$field {
        mr_opts.theme.git_branch_label_colors[$idx] = v.clone();
      }
    };
  }

  apply_git!(0, git0);
  apply_git!(1, git1);
  apply_git!(2, git2);
  apply_git!(3, git3);
  apply_git!(4, git4);
  apply_git!(5, git5);
  apply_git!(6, git6);
  apply_git!(7, git7);
  apply_git_inv!(0, git_inv0);
  apply_git_inv!(1, git_inv1);
  apply_git_inv!(2, git_inv2);
  apply_git_inv!(3, git_inv3);
  apply_git_inv!(4, git_inv4);
  apply_git_inv!(5, git_inv5);
  apply_git_inv!(6, git_inv6);
  apply_git_inv!(7, git_inv7);
  apply_git_branch_label!(0, git_branch_label0);
  apply_git_branch_label!(1, git_branch_label1);
  apply_git_branch_label!(2, git_branch_label2);
  apply_git_branch_label!(3, git_branch_label3);
  apply_git_branch_label!(4, git_branch_label4);
  apply_git_branch_label!(5, git_branch_label5);
  apply_git_branch_label!(6, git_branch_label6);
  apply_git_branch_label!(7, git_branch_label7);

  apply_theme!(git_commit_label_color);
  apply_theme!(git_commit_label_background);
  apply_theme!(git_tag_label_color);
  apply_theme!(git_tag_label_background);
  apply_theme!(git_tag_label_border);

  // ── pie colors ─────────────────────────────────────────────────
  macro_rules! apply_pie {
    ($idx:literal, $field:ident) => {
      if let Some(ref v) = opts.$field {
        mr_opts.theme.pie_colors[$idx] = v.clone();
      }
    };
  }
  apply_pie!(0, pie1);
  apply_pie!(1, pie2);
  apply_pie!(2, pie3);
  apply_pie!(3, pie4);
  apply_pie!(4, pie5);
  apply_pie!(5, pie6);
  apply_pie!(6, pie7);
  apply_pie!(7, pie8);
  apply_pie!(8, pie9);
  apply_pie!(9, pie10);
  apply_pie!(10, pie11);
  apply_pie!(11, pie12);

  if let Some(v) = opts.pie_title_text_size { mr_opts.theme.pie_title_text_size = v as f32; }
  if let Some(ref v) = opts.pie_title_text_color { mr_opts.theme.pie_title_text_color = v.clone(); }
  if let Some(v) = opts.pie_section_text_size { mr_opts.theme.pie_section_text_size = v as f32; }
  if let Some(ref v) = opts.pie_section_text_color { mr_opts.theme.pie_section_text_color = v.clone(); }
  if let Some(v) = opts.pie_legend_text_size { mr_opts.theme.pie_legend_text_size = v as f32; }
  if let Some(ref v) = opts.pie_legend_text_color { mr_opts.theme.pie_legend_text_color = v.clone(); }
  if let Some(ref v) = opts.pie_stroke_color { mr_opts.theme.pie_stroke_color = v.clone(); }
  if let Some(v) = opts.pie_stroke_width { mr_opts.theme.pie_stroke_width = v as f32; }
  if let Some(v) = opts.pie_outer_stroke_width { mr_opts.theme.pie_outer_stroke_width = v as f32; }
  if let Some(ref v) = opts.pie_outer_stroke_color { mr_opts.theme.pie_outer_stroke_color = v.clone(); }
  if let Some(v) = opts.pie_opacity { mr_opts.theme.pie_opacity = v as f32; }

  // ── layout ─────────────────────────────────────────────────────
  if let Some(v) = opts.node_spacing { mr_opts.layout.node_spacing = v as f32; }
  if let Some(v) = opts.rank_spacing { mr_opts.layout.rank_spacing = v as f32; }
  if let Some(v) = opts.preferred_aspect_ratio { mr_opts.layout.preferred_aspect_ratio = Some(v as f32); }
  if let Some(v) = opts.fast_text_metrics { mr_opts.layout.fast_text_metrics = v; }

  mr_opts
}

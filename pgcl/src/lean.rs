use color_eyre::{eyre::eyre, Result};
use once_cell::sync::OnceCell;
use syntect::{
    easy::HighlightLines,
    highlighting::{Color, ThemeSet},
    parsing::{SyntaxDefinition, SyntaxSet},
    util::LinesWithEndings,
};

use crate::{HighlightToken, Highlighted, TokenType};

pub struct LeanSyntax {
    ps: SyntaxSet,
    theme: syntect::highlighting::Theme,
    syntax: syntect::parsing::SyntaxReference,
}

static INSTANCE: OnceCell<LeanSyntax> = OnceCell::new();

impl LeanSyntax {
    pub fn get() -> &'static LeanSyntax {
        INSTANCE.get_or_init(|| LeanSyntax::build().unwrap())
    }
    fn build() -> Result<LeanSyntax> {
        let mut builder = SyntaxSet::load_defaults_newlines().into_builder();

        let syntax = SyntaxDefinition::load_from_str(
            include_str!("../syntaxes/Lean.sublime-syntax"),
            true,
            None,
        )
        .unwrap();
        builder.add(syntax);
        let ps = builder.build();
        let ts = ThemeSet::load_defaults();
        let theme = ts
            .themes
            .get("InspiredGitHub")
            .or_else(|| ts.themes.get("base16-ocean.dark"))
            .ok_or_else(|| eyre!("No default theme found"))?
            .clone();

        let syntax = ps
            .find_syntax_by_name("Lean")
            .or_else(|| ps.find_syntax_by_extension("lean"))
            .unwrap()
            .clone();

        Ok(LeanSyntax { ps, theme, syntax })
    }
    pub fn highlight(&self, contents: &str) -> Result<Highlighted> {
        let mut h = HighlightLines::new(&self.syntax, &self.theme);
        let mut out = Highlighted { tokens: Vec::new() };
        for line in LinesWithEndings::from(contents) {
            let ranges = h.highlight_line(line, &self.ps).map_err(|e| eyre!(e))?;

            for (s, v) in ranges {
                let color = |r, g, b, a| Color { r, g, b, a };
                let color_a = color(167, 29, 93, 255);
                let color_b = color(50, 50, 50, 255);
                let color_c = color(121, 93, 163, 255);
                let color_d = color(0, 134, 179, 255);
                let color_e = color(98, 163, 92, 255);
                let color_string = color(24, 54, 145, 255);
                let color_comment = color(150, 152, 150, 255);

                let token_type = if s.foreground == color_a {
                    TokenType::Number
                } else if s.foreground == color_b {
                    TokenType::Ident
                } else if s.foreground == color_c {
                    TokenType::Ident
                } else if s.foreground == color_d {
                    TokenType::Ident
                } else if s.foreground == color_e {
                    TokenType::Keyword
                } else if s.foreground == color_comment {
                    TokenType::Punctuation
                } else if s.foreground == color_string {
                    TokenType::Number
                } else {
                    todo!("{s:?}")
                };
                out.tokens.push(HighlightToken {
                    text: v.trim_matches('\n').to_string(),
                    token_type,
                })
            }
            out.tokens.push(HighlightToken {
                text: "\n".to_string(),
                token_type: TokenType::WhiteSpace,
            });
        }
        Ok(out)
    }
}

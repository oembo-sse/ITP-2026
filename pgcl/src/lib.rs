mod ast;
mod ext;
mod fmt;
mod lean;
mod parse;
mod pgcl;
mod utils;

use std::collections::{BTreeMap, BTreeSet};

use ast::{BExpr, Cmd, Expr, ExprKind};
use logos::Logos;
use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
    console_error_panic_hook::set_once();
    tracing_wasm::set_as_global_default();

    Ok(())
}

#[wasm_bindgen]
pub fn parse(src: String) -> Option<ast::File> {
    match parse::parse_file(&src) {
        Ok(file) => Some(file),
        Err(err) => {
            tracing::error!("{:?}", err);
            None
        }
    }
}

// #[wasm_bindgen]
// pub fn initial_state(file: ast::File) -> State {
//     State::initial(&file)
// }

// #[wasm_bindgen]
// pub fn op(state: State) -> Steps {
//     Steps { steps: state.op() }
// }

// #[wasm_bindgen]
// pub fn initial_tree(file: ast::File) -> ExecutionTree {
//     ExecutionTree::new(State::initial(&file), 1.0)
// }
// #[wasm_bindgen]
// pub fn grow_n(tree: ExecutionTree, n: usize) -> ExecutionTree {
//     let mut tree = tree;
//     for _ in 0..n {
//         tree.grow_all(50);
//     }
//     tree
// }
// #[wasm_bindgen]
// pub fn grow_at(tree: ExecutionTree, key: String) -> ExecutionTree {
//     let mut tree = tree;
//     tree.grow_at(&key);
//     tree
// }
// #[wasm_bindgen]
// pub fn sample(tree: ExecutionTree, expr: String) -> Sampling {
//     let Ok(expr) = parse::parse_expr(&expr) else {
//         return Sampling {
//             samples: Vec::new(),
//             weights: Vec::new(),
//         };
//     };
//     tree.sample(&expr)
// }

#[derive(Debug, Default, Clone, PartialEq, PartialOrd, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct Sampling {
    pub samples: Vec<f64>,
    pub weights: Vec<f64>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
#[wasm_bindgen]
pub struct Execution {
    key: String,
    state: State,
    modifier: String,
    prob: OrdF64,
    children: Vec<Execution>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct SmallExecutionTree {
    pub key: String,
    pub data: String,
    pub modifier: String,
    pub children: Vec<SmallExecutionTree>,
}

#[wasm_bindgen]
impl Execution {
    pub fn from_file(file: ast::File) -> Execution {
        Execution::new(None, State::initial(&file), 0, 1.0)
    }
    fn new(parent: Option<&Execution>, root: State, idx: usize, prob: f64) -> Execution {
        let modifier = if prob == 0.0 {
            "dead"
        } else if let ast::CmdKind::Sink = root.cmd.kind.as_ref() {
            "mark"
        } else {
            ""
        };
        Execution {
            key: parent
                .map(|e| format!("{}:{idx}", e.key))
                .unwrap_or_default(),
            state: root,
            prob: OrdF64(prob),
            modifier: modifier.to_string(),
            children: Vec::new(),
        }
    }
    pub fn grow_all(&mut self, fuel: usize) {
        if fuel == 0 {
            return;
        }

        if let ast::CmdKind::Sink = self.state.cmd.kind.as_ref() {
            return;
        }

        if self.children.is_empty() {
            for (idx, (_act, p, state)) in self.state.op().into_iter().enumerate() {
                self.children
                    .push(Execution::new(Some(self), state, idx, self.prob.0 * p.0));
            }
        } else {
            for child in &mut self.children {
                child.grow_all(fuel - 1);
            }
        }
    }
    pub fn grow_at(&mut self, key: &str) {
        if let ast::CmdKind::Sink = self.state.cmd.kind.as_ref() {
            return;
        }

        for child in &mut self.children {
            child.grow_at(key);
        }

        if self.key == key && self.children.is_empty() {
            for (idx, (_act, p, state)) in self.state.op().into_iter().enumerate() {
                self.children
                    .push(Execution::new(Some(self), state, idx, self.prob.0 * p.0));
            }
        }
    }
    pub fn data(&self, key: &str) -> Option<String> {
        if self.key == key {
            Some(format!(r"{} \times {}", self.state.tex(), self.prob.0))
        } else {
            self.children.iter().find_map(|child| child.data(key))
        }
    }
    pub fn tree(&self) -> SmallExecutionTree {
        SmallExecutionTree {
            key: self.key.clone(),
            // key: "".to_string(),
            // data: format!(r"{} \times {}", self.state.tex(), self.prob),
            data: self.key.clone(),
            modifier: self.modifier.clone(),
            children: self.children.iter().map(|child| child.tree()).collect(),
        }
    }
    pub fn sample(&self, expr: &str) -> Sampling {
        parse::parse_expr(expr)
            .map(|expr| self.sample_expr(&expr))
            .unwrap_or_default()
    }
}
impl Execution {
    pub fn sample_expr(&self, expr: &Expr) -> Sampling {
        let mut samples = Vec::new();
        let mut weights = Vec::new();
        self.sample_inner(expr, &mut samples, &mut weights);
        Sampling { samples, weights }
    }
    fn sample_inner(&self, expr: &Expr, samples: &mut Vec<f64>, weights: &mut Vec<f64>) {
        if let ast::CmdKind::Sink = self.state.cmd.kind.as_ref() {
            samples.push(expr.eval(&self.state.mem));
            weights.push(self.prob.0);
        }
        for child in &self.children {
            child.sample_inner(expr, samples, weights);
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
// #[tsify(into_wasm_abi, from_wasm_abi)]
pub struct Steps {
    pub steps: BTreeSet<(Act, OrdF64, State)>,
}

pub type Mem = BTreeMap<String, OrdF64>;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct OrdF64(pub f64);

pub const ZERO: OrdF64 = OrdF64(0.0);
pub const ONE: OrdF64 = OrdF64(1.0);

impl Eq for OrdF64 {}

impl PartialOrd for OrdF64 {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.0.partial_cmp(&other.0)
    }
}
impl Ord for OrdF64 {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.partial_cmp(other).unwrap()
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
// #[tsify(into_wasm_abi, from_wasm_abi)]
pub struct State {
    pub cmd: ast::Cmd,
    pub mem: Mem,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
// #[tsify(into_wasm_abi, from_wasm_abi)]
pub enum Act {
    N,
    L,
    R,
}

impl State {
    pub fn initial(file: &ast::File) -> State {
        State {
            cmd: file.cmd.clone(),
            mem: file.cmd.fv().into_iter().map(|var| (var, ZERO)).collect(),
        }
    }
    pub fn sink(mem: Mem) -> State {
        State {
            cmd: Cmd::parsed(0, 0, ast::CmdKind::Sink),
            mem,
        }
    }
    pub fn op(&self) -> BTreeSet<(Act, OrdF64, State)> {
        self.cmd
            .next(&self.mem)
            .into_iter()
            .map(|(act, p, cmd, mem)| (act, p, State { cmd, mem }))
            .collect()
    }
}

impl Cmd {
    pub fn next(&self, mem: &Mem) -> BTreeSet<(Act, OrdF64, Cmd, Mem)> {
        match self.kind.as_ref() {
            ast::CmdKind::Sink => [(Act::N, ONE, Cmd::sink(), mem.clone())].into(),
            ast::CmdKind::Skip => [(Act::N, ONE, Cmd::sink(), mem.clone())].into(),
            ast::CmdKind::Seq(c1, c2) => c1
                .next(mem)
                .into_iter()
                .map(|(act, p, cmd, mem)| match cmd.kind.as_ref() {
                    ast::CmdKind::Sink => (act, p, c2.clone(), mem),
                    _ => (
                        act,
                        p,
                        Cmd::parsed(0, 0, ast::CmdKind::Seq(cmd, c2.clone())),
                        mem,
                    ),
                })
                .collect(),
            ast::CmdKind::Assign(var, expr) => {
                let mut mem = mem.clone();
                mem.insert(var.text.clone(), OrdF64(expr.eval(&mem)));
                [(Act::N, ONE, Cmd::sink(), mem)].into()
            }
            ast::CmdKind::Prob(c1, p, c2) => {
                let p = p.eval(mem);
                [
                    (Act::N, OrdF64(p), c1.clone(), mem.clone()),
                    (Act::N, OrdF64(1.0 - p), c2.clone(), mem.clone()),
                ]
                .into()
            }
            ast::CmdKind::Nondet(c1, c2) => [
                (Act::L, ONE, c1.clone(), mem.clone()),
                (Act::R, ONE, c2.clone(), mem.clone()),
            ]
            .into(),
            ast::CmdKind::Ite(bexpr, c1, c2) => {
                if bexpr.eval(mem) {
                    [(Act::N, ONE, c1.clone(), mem.clone())].into()
                } else {
                    [(Act::N, ONE, c2.clone(), mem.clone())].into()
                }
            }
            ast::CmdKind::Loop(bexpr, cmd) => {
                if bexpr.eval(mem) {
                    [(
                        Act::N,
                        ONE,
                        Cmd::parsed(
                            0,
                            0,
                            ast::CmdKind::Seq(
                                cmd.clone(),
                                Cmd::parsed(0, 0, ast::CmdKind::Loop(bexpr.clone(), cmd.clone())),
                            ),
                        ),
                        mem.clone(),
                    )]
                    .into()
                } else {
                    [(Act::N, ONE, Cmd::sink(), mem.clone())].into()
                }
            }
            ast::CmdKind::Observe(bexpr) => {
                if bexpr.eval(mem) {
                    [(Act::N, ONE, Cmd::sink(), mem.clone())].into()
                } else {
                    [(Act::N, ZERO, Cmd::sink(), mem.clone())].into()
                }
            }
        }
    }
}

impl Expr {
    pub fn eval(&self, mem: &Mem) -> f64 {
        match self.kind.as_ref() {
            ExprKind::Var(var) => mem.get(&var.text).copied().unwrap_or(ZERO).0,
            ExprKind::Num(num) => *num as _,
            ExprKind::Minus(e) => -e.eval(mem),
            ExprKind::Op(l, op, r) => match op {
                ast::ExprOp::Add => l.eval(mem) + r.eval(mem),
                ast::ExprOp::Sub => l.eval(mem) - r.eval(mem),
                ast::ExprOp::Mul => l.eval(mem) * r.eval(mem),
                ast::ExprOp::Div => l.eval(mem) / r.eval(mem),
                ast::ExprOp::Pow => l.eval(mem).powf(r.eval(mem)),
            },
        }
    }
}

impl BExpr {
    pub fn eval(&self, mem: &Mem) -> bool {
        match self.kind.as_ref() {
            ast::BExprKind::Bool(b) => *b,
            ast::BExprKind::Logic(l, op, r) => match op {
                ast::LogicOp::And => l.eval(mem) && r.eval(mem),
                ast::LogicOp::Or => l.eval(mem) || r.eval(mem),
            },
            ast::BExprKind::Rel(l, op, r) => match op {
                ast::RelOp::Eq => l.eval(mem) == r.eval(mem),
                ast::RelOp::Ne => l.eval(mem) != r.eval(mem),
                ast::RelOp::Lt => l.eval(mem) < r.eval(mem),
                ast::RelOp::Le => l.eval(mem) <= r.eval(mem),
                ast::RelOp::Gt => l.eval(mem) > r.eval(mem),
                ast::RelOp::Ge => l.eval(mem) >= r.eval(mem),
            },
        }
    }
}

#[wasm_bindgen]
pub fn highlight_pgcl(src: &str) -> Highlighted {
    let tokens = highlight(src)
        .into_iter()
        .map(|(text, token_type)| HighlightToken {
            text: text.to_string(),
            token_type,
        })
        .collect();
    Highlighted { tokens }
}

#[wasm_bindgen]
pub fn highlight_lean(src: &str) -> Highlighted {
    lean::LeanSyntax::get().highlight(src).unwrap()
}

fn highlight(src: &str) -> Vec<(&str, TokenType)> {
    use Token::*;

    let mut lexer = Token::lexer(src);

    let mut tokens = Vec::new();

    while let Some(tok) = lexer.next() {
        let slice = lexer.slice();
        let Ok(tok) = tok else {
            tokens.push((slice, TokenType::WhiteSpace));
            continue;
        };
        let token = match tok {
            Whitespace => TokenType::WhiteSpace,
            Number(_) => TokenType::Number,
            Ident(_) => TokenType::Ident,
            Eq | Ne | Le | Ge | Lt | Gt | Add | Sub | Mul | Div | And | Or | Assign => {
                TokenType::Op
            }
            Semicolon | LBrace | RBrace | LParen | RParen | LBracket | RBracket => {
                TokenType::Punctuation
            }
            If | While | Skip | Observe => TokenType::Keyword,
            Marker(_) => TokenType::Marker,
            MarkerEnd => TokenType::MarkerEnd,
        };
        tokens.push((slice, token));
    }

    // Delete all whitespace directly after markers
    let mut i = 0;
    while i < tokens.len() {
        if tokens[i].1 == TokenType::Marker {
            let j = i + 1;
            while j < tokens.len() && tokens[j].1 == TokenType::WhiteSpace {
                tokens.remove(j);
            }
        }
        i += 1;
    }

    tokens
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct Highlighted {
    pub tokens: Vec<HighlightToken>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct HighlightToken {
    pub text: String,
    pub token_type: TokenType,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum TokenType {
    WhiteSpace,
    Number,
    Ident,
    Op,
    Keyword,
    Punctuation,
    Marker,
    MarkerEnd,
}

#[derive(logos::Logos, Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Token {
    #[regex(r"[ \t\n\f]+")]
    Whitespace,
    #[regex(r"[0-9]+", |lex| lex.slice().parse::<i64>().unwrap())]
    Number(i64),
    #[regex(r"[a-zA-Z_][a-zA-Z0-9_]*", |lex| lex.slice().to_string())]
    Ident(String),
    #[regex(r"@[a-zA-Z_][a-zA-Z0-9_]*", |lex| lex.slice().to_string())]
    Marker(String),
    #[token("$")]
    MarkerEnd,
    #[token("=")]
    Eq,
    #[token("!=")]
    Ne,
    #[token("<=")]
    Le,
    #[token(">=")]
    Ge,
    #[token("<")]
    Lt,
    #[token(">")]
    Gt,
    #[token("+")]
    Add,
    #[token("-")]
    Sub,
    #[token("*")]
    Mul,
    #[token("/")]
    Div,
    #[token("&&")]
    And,
    #[token("||")]
    Or,
    #[token(":=")]
    Assign,
    #[token(";")]
    Semicolon,
    #[token("{")]
    LBrace,
    #[token("}")]
    RBrace,
    #[token("(")]
    LParen,
    #[token(")")]
    RParen,
    #[token("[")]
    LBracket,
    #[token("]")]
    RBracket,
    #[token("if")]
    If,
    #[token("while")]
    While,
    #[token("skip")]
    Skip,
    #[token("observe")]
    Observe,
}

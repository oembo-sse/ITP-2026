use std::rc::Rc;

use wasm_bindgen::prelude::wasm_bindgen;

use crate::parse::SourceSpan;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
#[wasm_bindgen]
pub struct File {
    pub(crate) cmd: Cmd,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Cmd {
    pub span: SourceSpan,
    pub kind: Rc<CmdKind>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum CmdKind {
    Skip,
    Sink,
    Assign(Var, Expr),
    Seq(Cmd, Cmd),
    Prob(Cmd, Expr, Cmd),
    Nondet(Cmd, Cmd),
    Ite(BExpr, Cmd, Cmd),
    Loop(BExpr, Cmd),
    Observe(BExpr),
}

impl Cmd {
    pub fn parsed(l: usize, r: usize, kind: CmdKind) -> Cmd {
        Cmd {
            span: (l, r).into(),
            kind: Rc::new(kind),
        }
    }

    pub(crate) fn sink() -> Cmd {
        Cmd::parsed(0, 0, CmdKind::Sink)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Var {
    pub span: SourceSpan,
    pub text: String,
}

impl Var {
    pub fn parsed(l: usize, r: usize, text: String) -> Var {
        Var {
            span: (l, r).into(),
            text,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct BExpr {
    pub span: SourceSpan,
    pub has_paren: bool,
    pub kind: Rc<BExprKind>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum BExprKind {
    Bool(bool),
    Logic(BExpr, LogicOp, BExpr),
    Rel(Expr, RelOp, Expr),
}

impl BExpr {
    pub fn parsed(l: usize, r: usize, kind: BExprKind) -> BExpr {
        BExpr {
            span: (l, r).into(),
            has_paren: false,
            kind: Rc::new(kind),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum LogicOp {
    And,
    Or,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum RelOp {
    Eq,
    Ne,
    Lt,
    Le,
    Gt,
    Ge,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Expr {
    pub span: SourceSpan,
    pub has_paren: bool,
    pub kind: Rc<ExprKind>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum ExprKind {
    Var(Var),
    Num(i64),
    Minus(Expr),
    Op(Expr, ExprOp, Expr),
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum ExprOp {
    Add,
    Sub,
    Mul,
    Div,
    Pow,
}

impl Expr {
    pub fn parsed(l: usize, r: usize, kind: ExprKind) -> Expr {
        Expr {
            span: (l, r).into(),
            has_paren: false,
            kind: Rc::new(kind),
        }
    }
}

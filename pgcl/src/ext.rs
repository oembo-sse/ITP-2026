use std::collections::BTreeSet;

use crate::{
    ast::{BExpr, BExprKind, Cmd, CmdKind, Expr, ExprKind},
    State,
};

impl State {
    pub fn fv(&self) -> BTreeSet<String> {
        self.cmd.fv()
    }
}
impl Cmd {
    pub fn fv(&self) -> BTreeSet<String> {
        match self.kind.as_ref() {
            CmdKind::Sink => BTreeSet::new(),
            CmdKind::Skip => BTreeSet::new(),
            CmdKind::Assign(var, expr) => {
                let mut fv = expr.fv();
                fv.insert(var.text.clone());
                fv
            }
            CmdKind::Seq(c1, c2) => c1.fv().iter().chain(&c2.fv()).cloned().collect(),
            CmdKind::Prob(c1, e, c2) => c1
                .fv()
                .iter()
                .chain(&e.fv())
                .chain(&c2.fv())
                .cloned()
                .collect(),
            CmdKind::Nondet(c1, c2) => c1.fv().iter().chain(&c2.fv()).cloned().collect(),
            CmdKind::Ite(bexpr, c1, c2) => bexpr
                .fv()
                .iter()
                .chain(&c1.fv())
                .chain(&c2.fv())
                .cloned()
                .collect(),
            CmdKind::Loop(bexpr, c) => bexpr.fv().iter().chain(&c.fv()).cloned().collect(),
            CmdKind::Observe(bexpr) => bexpr.fv(),
        }
    }
}
impl Expr {
    pub fn fv(&self) -> BTreeSet<String> {
        match self.kind.as_ref() {
            ExprKind::Var(var) => [var.text.clone()].into(),
            ExprKind::Minus(e) => e.fv(),
            ExprKind::Num(_) => BTreeSet::new(),
            ExprKind::Op(l, _, r) => l.fv().iter().chain(&r.fv()).cloned().collect(),
        }
    }
}
impl BExpr {
    pub fn fv(&self) -> BTreeSet<String> {
        match self.kind.as_ref() {
            BExprKind::Bool(_) => BTreeSet::new(),
            BExprKind::Rel(l, _, r) => l.fv().iter().chain(&r.fv()).cloned().collect(),
            BExprKind::Logic(l, _, r) => l.fv().iter().chain(&r.fv()).cloned().collect(),
        }
    }
}

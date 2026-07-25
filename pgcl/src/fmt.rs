use itertools::Itertools;

use crate::{
    ast::{BExpr, BExprKind, Cmd, CmdKind, Expr, ExprKind, ExprOp, LogicOp, RelOp},
    OrdF64, State,
};

impl std::fmt::Display for State {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "({}, [{}])",
            self.cmd,
            self.mem
                .iter()
                .map(|(k, v)| format!("{k} => {v}"))
                .format(", ")
        )
    }
}

impl std::fmt::Display for OrdF64 {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl std::fmt::Display for Cmd {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.kind.as_ref() {
            CmdKind::Sink => write!(f, "sink"),
            CmdKind::Skip => write!(f, "skip"),
            CmdKind::Assign(var, expr) => write!(f, "{} := {}", var.text, expr),
            CmdKind::Seq(c1, c2) => write!(f, "{} ; {}", c1, c2),
            CmdKind::Prob(c1, e, c2) => write!(f, "{} [{}] {}", c1, e, c2),
            CmdKind::Nondet(c1, c2) => write!(f, "{{ {} }} [] {{ {} }}", c1, c2),
            CmdKind::Ite(bexpr, c1, c2) => {
                write!(f, "if {} {{ {} }} else {{ {} }}", bexpr, c1, c2)
            }
            CmdKind::Loop(bexpr, c) => write!(f, "while {} {{ {} }}", bexpr, c),
            CmdKind::Observe(bexpr) => write!(f, "observe {}", bexpr),
        }
    }
}

impl std::fmt::Display for Expr {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.kind.as_ref() {
            ExprKind::Var(var) => write!(f, "{}", var.text),
            ExprKind::Minus(e) => write!(f, "-{e}"),
            ExprKind::Num(num) => write!(f, "{num}"),
            ExprKind::Op(l, op, r) => write!(f, "({l} {op} {r})"),
        }
    }
}

impl std::fmt::Display for ExprOp {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ExprOp::Add => write!(f, "+"),
            ExprOp::Sub => write!(f, "-"),
            ExprOp::Mul => write!(f, "*"),
            ExprOp::Div => write!(f, "/"),
            ExprOp::Pow => write!(f, "^"),
        }
    }
}

impl std::fmt::Display for BExpr {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.kind.as_ref() {
            BExprKind::Bool(b) => write!(f, "{}", b),
            BExprKind::Logic(l, op, r) if self.has_paren => write!(f, "{} {} {}", l, op, r),
            BExprKind::Logic(l, op, r) => write!(f, "({} {} {})", l, op, r),
            BExprKind::Rel(l, op, r) if self.has_paren => write!(f, "{} {} {}", l, op, r),
            BExprKind::Rel(l, op, r) => write!(f, "({} {} {})", l, op, r),
        }
    }
}

impl std::fmt::Display for LogicOp {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LogicOp::And => write!(f, "&&"),
            LogicOp::Or => write!(f, "||"),
        }
    }
}

impl std::fmt::Display for RelOp {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RelOp::Eq => write!(f, "="),
            RelOp::Ne => write!(f, "!="),
            RelOp::Lt => write!(f, "<"),
            RelOp::Le => write!(f, "<="),
            RelOp::Gt => write!(f, ">"),
            RelOp::Ge => write!(f, ">="),
        }
    }
}

impl State {
    pub fn tex(&self) -> String {
        format!(
            r"\state{{{}}}{{[{}]}}",
            self.cmd.tex(),
            self.mem
                .iter()
                .map(|(k, v)| format!(r"{} \mapsto {}", k, v))
                .join(", ")
        )
    }
}
impl Cmd {
    pub fn tex(&self) -> String {
        match self.kind.as_ref() {
            CmdKind::Sink => r"\sink".to_string(),
            CmdKind::Skip => r"\skip".to_string(),
            CmdKind::Assign(var, expr) => {
                format!(r"\assign{{{}}}{{{}}}", var.text, expr.tex())
            }
            CmdKind::Seq(c1, c2) => format!(r"\seq{{{}}}{{{}}}", c1.tex(), c2.tex()),
            CmdKind::Prob(c1, p, c2) => {
                format!(r"\prob{{{}}}{{{}}}{{{}}}", c1.tex(), p.tex(), c2.tex())
            }
            CmdKind::Nondet(c1, c2) => format!(r"\nondet{{{}}}{{{}}}", c1.tex(), c2.tex()),
            CmdKind::Ite(bexpr, c1, c2) => {
                format!(r"\ite{{{}}}{{{}}}{{{}}}", bexpr.tex(), c1.tex(), c2.tex())
            }
            CmdKind::Loop(bexpr, c) => format!(r"\loop{{{}}}{{{}}}", bexpr.tex(), c.tex()),
            CmdKind::Observe(bexpr) => format!(r"\observe{{{}}}", bexpr.tex()),
        }
    }
}
impl Expr {
    pub fn tex(&self) -> String {
        match self.kind.as_ref() {
            ExprKind::Var(var) => var.text.clone(),
            ExprKind::Num(num) => num.to_string(),
            ExprKind::Minus(num) => format!("-{}", num.to_string()),
            ExprKind::Op(l, op, r) if self.has_paren => {
                format!(r"({} {} {})", l.tex(), op.tex(), r.tex())
            }
            ExprKind::Op(l, op, r) => format!(r"{} {} {}", l.tex(), op.tex(), r.tex()),
        }
    }
}
impl ExprOp {
    pub fn tex(&self) -> String {
        match self {
            ExprOp::Add => "+".to_string(),
            ExprOp::Sub => "-".to_string(),
            ExprOp::Mul => r"*".to_string(),
            ExprOp::Div => r"/".to_string(),
            ExprOp::Pow => r"\^{}".to_string(),
        }
    }
}
impl BExpr {
    pub fn tex(&self) -> String {
        match self.kind.as_ref() {
            BExprKind::Bool(b) => b.to_string(),
            BExprKind::Logic(l, op, r) => format!(r"({} {} {})", l.tex(), op.tex(), r.tex()),
            BExprKind::Rel(l, op, r) => format!(r"({} {} {})", l.tex(), op.tex(), r.tex()),
        }
    }
}
impl LogicOp {
    pub fn tex(&self) -> String {
        match self {
            LogicOp::And => r"\land".to_string(),
            LogicOp::Or => r"\lor".to_string(),
        }
    }
}
impl RelOp {
    pub fn tex(&self) -> String {
        match self {
            RelOp::Eq => r"=".to_string(),
            RelOp::Ne => r"\neq".to_string(),
            RelOp::Lt => r"<".to_string(),
            RelOp::Le => r"\leq".to_string(),
            RelOp::Gt => r">".to_string(),
            RelOp::Ge => r"\geq".to_string(),
        }
    }
}

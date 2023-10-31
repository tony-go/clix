#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use napi::bindgen_prelude::{FromNapiValue, ToNapiValue};
use napi::Either;
use rexpect::spawn_bash;

use std::string::String;
use std::vec::Vec;

#[napi]
pub enum ActKind {
  Expect,
  ExpectError,
  ExitCode,
  Input,
}

type Value = Either<String, i32>;

#[napi(object)]
#[derive(Clone)]
pub struct Act {
  pub expected: Value,
  pub ok: bool,
  pub actual: Value,
  pub kind: ActKind,
}

#[napi(object)]
pub struct ScenarioResult {
  pub ok: bool,
}

#[napi(constructor)]
pub struct Scenario {
  pub command: String,
  pub timeout: u32,
  pub exit_code: i32,
  pub acts: Vec<Act>,
  pub status: bool,
}

#[napi]
impl Scenario {
  #[napi]
  pub fn expect(&mut self, value: String) -> &Self {
    self.acts.push(Act {
      expected: Either::A(value),
      ok: false,
      actual: Either::A(String::new()),
      kind: ActKind::Expect,
    });
    self
  }

  #[napi]
  pub fn expect_error(&mut self, value: String) -> &Self {
    self.acts.push(Act {
      expected: Either::A(value),
      ok: false,
      actual: Either::A(String::new()),
      kind: ActKind::ExpectError,
    });
    self
  }

  #[napi]
  pub fn exit_code(&mut self, code: i32) -> &Self {
    self.acts.push(Act {
      expected: Either::B(code),
      ok: false,
      actual: Either::B(0),
      kind: ActKind::ExitCode,
    });
    self
  }

  #[napi]
  pub fn input(&mut self, value: String) -> &Self {
    self.acts.push(Act {
      expected: Either::A(value),
      ok: false,
      actual: Either::A(String::new()),
      kind: ActKind::Input,
    });
    self
  }

  #[napi]
  pub async fn run(&self) -> ScenarioResult {
    // let p = spawn_bash(Some(self.timeout.into()));
    // match p {
    //   Ok(mut proc) => match self.acts[0].kind {
    //     ActKind::Expect => {
    //       proc.send_line(&self.command).unwrap();
    //       // proc.exp_string(&self.acts[0].expected.to_string()).unwrap();
    //       proc.wait_for_prompt().unwrap();
    //       let op = proc.read_line();
    //       println!("op: {:?}", op);
    //     }
    //     ActKind::ExpectError => {}
    //     ActKind::ExitCode => {}
    //     ActKind::Input => {}
    //   },
    //   Err(e) => {
    //     println!("Error: {}", e);
    //   }
    // }

    // p.wait_for_prompt();
    // let op = p.read_line();
    // println!("op: {:?}", op);
    // your implementation here
    // return a Result indicating either success with ClixResult
    // or failure with some error type
    ScenarioResult { ok: true }
  }
}

#[napi]
pub fn clix(command: String, timeout: u32) -> Scenario {
  Scenario {
    command,
    timeout,
    exit_code: 0,
    acts: Vec::new(),
    status: false,
  }
}

#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use napi::bindgen_prelude::{FromNapiValue, ToNapiValue};
use napi::Either;
use rexpect::error::Error;
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
    let mut act_pointer = 0;
    let mut p = spawn_bash(Some(self.timeout.into())).unwrap();

    p.send_line(self.command.as_str()).unwrap();

    let mut ok = false;
    loop {
      match p.exp_regex(".+") {
        Ok(matched) => {
          let actual = matched.1.trim();
          let current_act = &self.acts[act_pointer];
          match current_act.kind {
            ActKind::Expect => match current_act.expected {
              // String
              Either::A(ref expected_str) => {
                if actual == expected_str.to_string().trim() {
                  ok = true;
                }
              }
              // Vector of strings
              Either::B(ref expected_int) => {
                if actual == expected_int.to_string().trim() {
                  ok = true;
                }
              }
            },
            _ => {}
          }
          act_pointer += 1;
          break;
        }
        Err(e) => {
          match e {
            Error::EOF {
              expected,
              got,
              exit_code,
            } => {
              println!(
                "EOF reached. Expected: '{}', got: '{}', exit code: {:?}",
                expected, got, exit_code
              );
              break;
            }
            // Handle other specific errors or a general case
            _ => {
              println!("Error encountered: {:?}", e);
              ok = false;
              break;
            }
          }
        }
      }
    }

    ScenarioResult { ok }
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

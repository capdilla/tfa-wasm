mod otp;

use std::panic;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    let secret = otp::generate_secret();
    alert(&format!("Hello, {} the secret is {}!", name, secret));
}

#[wasm_bindgen(js_name = "generateOtp")]
pub fn generate_otp(secret: String) -> String {
    let otp_response = otp::generate_otp(secret.to_string());

    let result = format!("{};{}", otp_response.token, otp_response.next_timestamp);

    return result;
}

#[cfg(test)]
mod tests {
    use otp::generate_secret;
    use rand::Rng;

    use super::*;

    #[test]
    fn test_generate_otp() {
        let result = panic::catch_unwind(|| {
            // Call the function that you want to test

            let secret = generate_secret();
            let res = generate_otp(secret);

            println!("Result: {}", res);
        });

        assert!(result.is_ok(), "Function panicked when it should not have");
    }

    #[test]
    fn test_generate_otp_with_16_bytes() {
        let result = panic::catch_unwind(|| {
            // Call the function that you want to test

            let mut rng = rand::thread_rng();
            let data_byte: [u8; 16] = rng.gen();
            let base16_string: String =
                base32::encode(base32::Alphabet::RFC4648 { padding: false }, &data_byte)
                    .chars()
                    .take(16)
                    .collect(); // Collect the iterator into a String

            println!("Result: {}", base16_string);

            let res = generate_otp(base16_string);

            println!("Result: {}", res);
        });

        assert!(result.is_ok(), "Function panicked when it should not have");
    }

    #[test]
    fn test_otp_should_not_panic() {
        let result = panic::catch_unwind(|| {
            // set a random secret and malformed secret
            let res = generate_otp("123123i12m3i12m3".to_owned());
        });

        assert!(result.is_ok(), "Function panicked when it should not have");
    }

    // Add more tests as needed
}

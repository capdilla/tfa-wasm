use base32;
use rand::Rng;

use base32::{decode, Alphabet};
use totp_rs::{Algorithm, TOTP};

#[derive(Debug)]
pub enum GenerateTotpError {
    InvalidSecret,
    TotpCreationError,
}

fn generate_totp(secret_byte: String) -> Result<TOTP, GenerateTotpError> {
    // Attempt to convert the encoded secret into bytes
    let decoded_secret = decode(Alphabet::RFC4648 { padding: false }, &secret_byte);
    let secret = match decoded_secret {
        Some(mut bytes) => {
            // Ensure the secret is at least 20 bytes for SHA1 (pad with zeros if necessary)
            while bytes.len() < 20 {
                bytes.push(0);
            }
            bytes.truncate(20); // Truncate if too long
            bytes
        }
        None => {
            return Err(GenerateTotpError::InvalidSecret);
        }
    };

    println!("Secret len: {:?}", secret.len());

    // Attempt to create a TOTP instance with the secret bytes
    let totp = TOTP::new(Algorithm::SHA1, 6, 1, 30, secret)
        .map_err(|_| GenerateTotpError::TotpCreationError)?;

    // Return the TOTP instance if successful
    Ok(totp)
}

pub fn generate_secret() -> String {
    let mut rng = rand::thread_rng();
    let data_byte: [u8; 21] = rng.gen();
    let base32_string = base32::encode(base32::Alphabet::RFC4648 { padding: false }, &data_byte);

    let totp = match generate_totp(base32_string) {
        Ok(totp) => totp,
        Err(_) => {
            return "".to_string();
        }
    };

    let otp_base32 = totp.get_secret_base32();

    return otp_base32;
}

pub fn validate(secret: String, token: String) -> bool {
    let totp = match generate_totp(secret) {
        Ok(totp) => totp,
        Err(_) => return false,
    };

    match totp.check_current(&token) {
        Ok(is_valid) => is_valid, // Return the validity of the token
        Err(_) => false,          // Return false if there's an error during token validation
    }
}

pub struct OtpResponse {
    pub next_timestamp: u64,
    pub token: String,
}

pub fn generate_otp(secret: String) -> OtpResponse {
    let totp = match generate_totp(secret) {
        Ok(totp) => totp,
        Err(err) => {
            println!("Error: {:?}", err);
            return OtpResponse {
                next_timestamp: 0,
                token: "".to_string(),
            };
        }
    };

    let next_timestamp = totp.next_step_current().unwrap();

    let token = totp.generate_current().unwrap();

    return OtpResponse {
        next_timestamp: next_timestamp,
        token: token,
    };
}

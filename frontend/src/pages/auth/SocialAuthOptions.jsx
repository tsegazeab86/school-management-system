import { useState } from "react";
import { FaFacebookF, FaGithub, FaGoogle } from "react-icons/fa";
import "./SocialAuthOptions.css";

const providers = [
  { name: "Google", Icon: FaGoogle },
  { name: "GitHub", Icon: FaGithub },
  { name: "Facebook", Icon: FaFacebookF },
];

function SocialAuthOptions({ mode = "login" }) {
  const [notice, setNotice] = useState("");
  const isSignup = mode === "signup";
  const action = isSignup ? "sign-up" : "sign-in";

  return (
    <section className="social-auth-options" aria-label="Social authentication">
      <div className="social-auth-divider">
        <span>{isSignup ? "or sign up with" : "or continue with"}</span>
      </div>

      <div className="social-auth-buttons">
        {providers.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            className="social-auth-button"
            onClick={() =>
              setNotice(
                `${name} ${action} is not connected yet. Please use the form above.`
              )
            }
            aria-label={`${isSignup ? "Sign up" : "Sign in"} with ${name}`}
          >
            <Icon aria-hidden="true" />
            <span>{name}</span>
          </button>
        ))}
      </div>

      {notice && (
        <p className="social-auth-notice" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}

export default SocialAuthOptions;
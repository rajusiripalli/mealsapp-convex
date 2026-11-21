import * as AuthSession from "expo-auth-session";

export function getClerkSSORedirectUrl() {
  return AuthSession.makeRedirectUri({
    scheme: "mealapp",
    path: "sso-callback",
  });
}

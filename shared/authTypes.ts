export interface SignUpBody {
  username: string;
  password: string;
  email: string;
}

export interface ConfirmSignUpBody {
  username: string;
  code: string;
}

export interface SignInBody {
  username: string;
  password: string;
}

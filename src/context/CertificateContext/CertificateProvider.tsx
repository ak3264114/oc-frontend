import React, { createContext, useReducer } from "react";
import { apiBaseUrl } from "../../config";
import { CertificateReducer } from "./CertificateReducer";
import displayToast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { cookies } from "../AuthContext/AuthReducer";

export interface defaultState {}

const initialState: any = {};

const CertificateContext = createContext(initialState);
export default CertificateContext;

interface CertificateProviderProps {
  children?: React.ReactNode;
}

export const CertificateProvider: React.FC<CertificateProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(CertificateReducer, initialState);
  const GetprojectToken = async (ownerName: string, repoName: string) => {
    const url = `${apiBaseUrl}/project/github/${ownerName}/${repoName}`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${cookies.get("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error?.type === "GithubAPITimeoutError") {
          displayToast(
            "Please try again, it's an error from our side",
            "failure"
          ); //github 503 error
        } else if (data.error) {
          displayToast("Oops! Something went wrong", "failure");
        } else {
          dispatch({
            type: "GETPROJECTTOKEN",
            payload: data,
          });
          navigate("/projectpicker");
          displayToast("Project Fetched Successfully", "success");
        }
      })
      .catch((err) => {
        displayToast("Oops! Something went wrong", "failure");
      });
  };
  const GenerateCertificate = async (projectToken: string) => {
    const url = `${apiBaseUrl}/certificate`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${cookies.get("token")}`,
        "project-token": projectToken,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          displayToast("Oops! Something went wrong", "failure");
        } else {
          displayToast("Certificate generated Successfully", "success"); //github 503 error
          dispatch({
            type: "GENERATECERTIFICATE",
            payload: data,
          });
        }
      })
      .then(() => navigate("/certificate"))
      .catch((err) => {
        displayToast("Oops! Something went wrong", "failure");
      });
  };
  return (
    <CertificateContext.Provider
      value={
        {
          ...state,
          GetprojectToken,
          GenerateCertificate,
        } as any
      }
    >
      {children}
    </CertificateContext.Provider>
  );
};

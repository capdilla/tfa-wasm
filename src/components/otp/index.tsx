import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";

import { getDb } from "@/lib/db";
import init, { generateOtp } from "wasm";

import { TFA } from "../../interfaces";
import { CopyIcon } from "../icons/CopyIcon";
import { Card, CardContent } from "../ui/card";
import { FilePenIcon } from "../icons/FilePenIcon";
import { modalHandler } from "../ui/Modal";
import { Form } from "../form";
import { appState } from "../state";

interface CountBack {
  nextTimestamp: number;
  executeNext: () => void;
}
const CountBack = ({ nextTimestamp, executeNext }: CountBack) => {
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    if (nextTimestamp <= 0) {
      return;
    }
    // Get the current time in seconds (Unix timestamp)
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Calculate the remaining time in seconds
    const remainingTimeInSeconds = Number(nextTimestamp) - currentTimestamp;

    setTime(remainingTimeInSeconds);

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev === 0) {
          clearInterval(interval);
          executeNext();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextTimestamp]);

  return (
    <div className="text-sm text-muted-foreground">
      00:{time.toString().padStart(2, "0")}
    </div>
  );
};

interface OtpProps extends TFA {}
export const OTP = (props: OtpProps) => {
  const [token, setToken] = useState<string>("");
  const [nextTimestamp, setNextTimestamp] = useState<number>(0);

  const generate = useCallback(async () => {
    await init();

    const [token, nextTimestamp] = await generateOtp(props.secret).split(";");

    setToken(token);
    setNextTimestamp(Number(nextTimestamp));
  }, [props.secret]);

  useEffect(() => {
    generate();
  }, [generate]);

  const copyToken = useCallback(() => {
    navigator.clipboard.writeText(token);
  }, [token]);

  const editRecord = useCallback(() => {
    modalHandler.open({
      body: (
        <Form
          recordId={props.id}
          record={{
            issuer: props.issuer,
            label: props.label,
            secret: props.secret,
          }}
        />
      ),
    });
  }, [props.id, props.issuer, props.label, props.secret]);

  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <CountBack nextTimestamp={nextTimestamp} executeNext={generate} />

          <div>
            <div className="font-medium">{props.label}</div>
            <div className="text-sm text-muted-foreground">
              {token.replace(/(\d{3})(\d{3})/, "$1 $2")}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={copyToken}>
            <CopyIcon />
          </Button>
          <Button variant="ghost" size="icon" onClick={editRecord}>
            <FilePenIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const RenderOtps = () => {
  const { value } = appState.useValue({ key: "records" });

  useEffect(() => {
    const fetchData = async () => {
      const db = await getDb();

      const data = await db.getAll();

      const res = data?.map((record) => {
        const url = new URL(record.value.replace("otpauth", "http"));
        const params = new URLSearchParams(url.search);

        return {
          id: record.id,
          label: url.pathname.replace("/", ""),
          secret: params.get("secret"),
          issuer: params.get("issuer"),
        };
      });

      appState.observer.setKeyState("records", res as TFA[]);
    };

    fetchData();

    const sub = appState.observer.subscribe("action", (action) => {
      if (action === "refetch") {
        fetchData();
      }
    });

    return () => {
      appState.observer.unsubscribe(sub);
    };
  }, []);

  return (
    <>
      {value.map((otp, idx) => (
        <OTP
          id={otp.id}
          key={idx}
          issuer={otp.issuer}
          label={otp.label}
          secret={otp.secret}
        />
      ))}
    </>
  );
};

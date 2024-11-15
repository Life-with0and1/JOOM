"use client";

import { useGetCalls } from "@/hooks/use-getCalls";
import { CallRecording } from "@stream-io/node-sdk";
import { Call } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import MeetingCard from "./MeetingCard";
import Loader from "./Loader";

const CallList = ({ type }: { type: "upcoming" | "ended" | "recordings" }) => {
  const router = useRouter();
  const {
    endedCalls,
    callRecordings,
    upcomingCalls,
    isLoading,
  } = useGetCalls();

  const [recordings, setrecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recordings":
        return recordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCalls = () => {
    switch (type) {
      case "ended":
        return "No previous meetings";
      case "recordings":
        return "No recordings";
      case "upcoming":
        return "No upcoming meetings";
      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        callRecordings?.map((meeting) => meeting.queryRecordings()) ?? [],
      );

      const recordings = callData
        .filter((call) => call.recordings.length > 0)
        .flatMap((call) => call.recordings);

      const normalizedRecordings = recordings.map((recording) => ({
        ...recording,
        end_time: new Date(recording.end_time), 
      }));

      setrecordings(normalizedRecordings as unknown as CallRecording[]); 
    };

    if (type === 'recordings') {
      fetchRecordings();
    }
  }, [type, callRecordings]);

  const call = getCalls();
  const noCallsMessage = getNoCalls();

  if (isLoading) return <Loader />;
return (
  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
    {call && call.length > 0 ? (
      call.map((meeting: Call | CallRecording) => {
        const meetingId = 'id' in meeting ? (meeting as Call).id : (meeting as CallRecording).filename;
        
        return (
          <MeetingCard
            key={meetingId}
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                ? "/icons/upcoming.svg"
                : "/icons/recordings.svg"
            }
            title={
              'state' in meeting
                ? (meeting as Call).state?.custom?.description || "No Description"
                : (meeting as CallRecording).filename?.substring(0, 20) || "No Description"
            }
            // Add a fallback to prevent undefined from being passed
            date={
              'state' in meeting
                ? (meeting as Call).state?.startsAt?.toLocaleString() || "No Date"
                : (meeting as CallRecording).start_time?.toLocaleString() || "No Date"
            }
            isPreviousMeeting={type === "ended"}
            link={
              type === "recordings"
                ? (meeting as CallRecording).url
                : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
            }
            buttonIcon1={type === "recordings" ? "/icons/play.svg" : ""}
            buttonText={type === "recordings" ? "Play" : "Start"}
            handleClick={
              type === "recordings"
                ? () => {
                    router.push(`${(meeting as CallRecording).url}`);
                  }
                : () => router.push(`/meeting/${(meeting as Call).id}`)
            }
          />
        );
      })
    ) : (
      <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
    )}
  </div>
);
};

export default CallList;

"use client";

import React, { useState } from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import MeetingModal from "./MeetingModal";
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";
import ReactDatePicker from "react-datepicker";
import { Input } from "./ui/input";

const MeetingTypeList = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isjoiningMeeting" | "isInstantMeeting" | undefined
  >();

  const { user } = useUser();
  const client = useStreamVideoClient();
  const [value, setValue] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const [callDetails, setCallDetails] = useState<Call>();

  const createMeeting = async () => {
    if (!user || !client) return;
    try {
      if (!value.dateTime) {
        toast({ title: "Please select a date and time" });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call("default", id);

      if (!call) throw new Error("Failed to call");

      const startAt =
        value.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = value.description || "Instant meeting";
      await call.getOrCreate({
        data: {
          starts_at: startAt,
          custom: {
            description,
          },
        },
      });
      setCallDetails(call);
      if (!value.description) router.push(`/meeting/${call.id}`);

      toast({ title: "Meeting created" });
    } catch (error) {
      toast({ title: "Failed to create meeting" });
    }
  };

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`;

  return (
    <div>
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <HomeCard
          img="/icons/add-meeting.svg"
          title="New Meeting"
          description="Start an instant meeting"
          handleClick={() => setMeetingState("isInstantMeeting")}
          className="bg-orange-1"
        />
        <HomeCard
          img="/icons/schedule.svg"
          title="Schedule"
          description="Plan your meeting"
          handleClick={() => setMeetingState("isScheduleMeeting")}
          className="bg-blue-1"
        />
        <HomeCard
          img="/icons/recordings.svg"
          title="View Recordings"
          description="Check out your recordings"
          handleClick={() => router.push("/recordings")}
          className="bg-purple-1"
        />
        <HomeCard
          img="/icons/join-meeting.svg"
          title="Join Meeting"
          description="via invitation lin"
          handleClick={() => setMeetingState("isjoiningMeeting")}
          className="bg-yellow-1"
        />
        {!callDetails ? (
          <MeetingModal
            isOpen={meetingState === "isScheduleMeeting"}
            onClose={() => setMeetingState(undefined)}
            title="Create Meeting"
            className="text-center"
            buttonText="Schedule Meeting"
            handleClick={createMeeting}
          >
            <div className="flex flex-col gap-2.5">
              <label className="text-base text-normal leading-[22px] text-sky-2">
                Add a description
              </label>
              <Textarea
                onChange={(e) =>
                  setValue({ ...value, description: e.target.value })
                }
                className="border-none bg-dark-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="flex w-full flex-col gap-2.5 ">
              <label className="text-base text-normal leading-[22px] text-sky-2">
                Select Date and Time
              </label>
              <ReactDatePicker
                selected={value.dateTime}
                onChange={(date) => setValue({ ...value, dateTime: date! })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full rounded bg-dark-2 p-2 focus:outline-none"
              />
            </div>
          </MeetingModal>
        ) : (
          <MeetingModal
            isOpen={meetingState === "isScheduleMeeting"}
            onClose={() => setMeetingState(undefined)}
            title="Meeting created"
            className="text-center"
            handleClick={() => {
              navigator.clipboard.writeText(meetingLink);
              toast({ title: "Link copied" });
            }}
            image="/icons/checked.svg"
            buttonIcon="/icons/copy.svg"
            buttonText="Copy Meeting Link"
          />
        )}
        <MeetingModal
          isOpen={meetingState === "isjoiningMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Type the link here"
          className="text-center"
          buttonText="Join Meeting"
          handleClick={() => router.push(value.link)}
        >
          <Input
            placeholder="Meeting link"
            onChange={(e) => setValue({ ...value, link: e.target.value })}
            className="border-none bg-dark-3 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
          />
        </MeetingModal>
      </section>
    </div>
  );
};

export default MeetingTypeList;

"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import SimpleMDE from "react-simplemde-editor";
import axios from "axios";
import "easymde/dist/easymde.min.css";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const NewIssuePage = () => {
  const router = useRouter();
  const { register, control, handleSubmit } = useForm();
  const { toast } = useToast();
  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        try {
          const response = await axios.post("/api/issues", data);
          console.log(response.data);
          router.push("/issues");
        } catch (error) {
          console.log(error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
          });
        }
      })}
      className=" flex flex-col justify-center items-center gap-4 min-h-screen"
    >
      <Input
        type="text"
        className="max-w-sm sm:max-w-lg"
        placeholder="Name"
        {...register("name")}
      />
      <Input
        type="text"
        className="max-w-sm sm:max-w-lg"
        placeholder="Title"
        {...register("title")}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <SimpleMDE placeholder="Description" {...field} />
        )}
      />
      <Button className="mt-5 p-4">Submit issue</Button>
    </form>
  );
};

export default NewIssuePage;

"use client";
import { useRef, useEffect, useState } from "react";
import { Button } from "@radix-ui/themes";
import Link from "next/link";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import Modal from "../components/Modal";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";

const IssuePage = () => {
  const currentRef = useRef(null);
  const [issueData, setIssueData] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionDetails, setSelectedQuestionDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const singleEval = {
    initial: {
      opacity: 0.1,
    },
    enter: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.65, 0, 0.35, 1],
      },
    },
    exit: {
      opacity: 0.9,
    },
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        currentRef.current &&
        !currentRef.current.contains(event.target) &&
        selectedQuestion
      ) {
        setSelectedQuestion(null);
      }
    }
    // Set the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currentRef, selectedQuestion]);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await axios.get("/api/issues");
        const data = await response.data.data;

        setIssueData(data);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };

    fetchIssue();
  }, []);

  const { register, control, handleSubmit } = useForm();
  const { toast } = useToast();
  const router = useRouter();
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredIssues =
    issueData &&
    issueData.filter((issue) =>
      issue.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const dateConvertor = (createdAt) => {
    const dateString = createdAt;
    // Create a Date object from the given date string
    const date = new Date(dateString);

    // Get day, month, and year components
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" }); // Get month name
    const year = date.getFullYear();

    // Get the suffix for the day (st, nd, rd, or th)
    let daySuffix;
    if (day >= 11 && day <= 13) {
      daySuffix = "th";
    } else {
      switch (day % 10) {
        case 1:
          daySuffix = "st";
          break;
        case 2:
          daySuffix = "nd";
          break;
        case 3:
          daySuffix = "rd";
          break;
        default:
          daySuffix = "th";
      }
    }

    // Construct the date string in the format "daySuffix monthName year"
    const formattedDate = `${day}${daySuffix} ${month} ${year}`;

    return formattedDate;
  };

  const handleRefresh = () => {
    window.location.reload();
  };
  const deleteIssue = async (id) => {
    try {
      const response = await axios.delete(`/api/issues/${id}`);
      if (response.status !== 200) {
        toast({
          variant: "destructive",
          title: "Error deleting issue.",
          description: `There was an error processing your request.`,
        });
      } else {
        setIssueData((prevIssues) =>
          prevIssues.filter((issue) => issue.id !== id)
        );
        toast({
          title: "Success!",
          description: `Issue deleted Successfully.`,
        });
      }
      console.log(response.data);
    } catch (error) {
      console.error("Error deleting issues:", error);
    }
  };

  const renderIssues = (issues) => {
    if (filteredIssues.length === 0) {
      return <div className="text-xl font-bold">No matching issues found.</div>;
    }

    return issues.map((item, i) => {
      const { id } = item;
      return (
        <div
          key={i}
          className="w-full flex flex-col gap-6 items-start rounded-md p-6 border bg-[#f3f0f0]  shadow-md  "
        >
          <div className="w-full flex justify-between items-center space-x-5 ">
            <div className="flex flex-col justify-center items-start">
              <h1 className="font-bold text-[#340406] text-sm sm:text-lg">
                Issue {i + 1}
              </h1>
              <p className="capitalize">
                {item.name} | {dateConvertor(item.createdAt)}
              </p>
            </div>
            <div className="flex justify-center items-center gap-4">
              <FaEdit
                onClick={() => {
                  setSelectedQuestion(id);
                  setSelectedQuestionDetails(
                    issueData.find((item) => item.id === id)
                  );
                }}
                size={30}
              />
              <MdDelete onClick={() => deleteIssue(item.id)} size={30} />
            </div>
          </div>
          <div className="relative flex flex-col gap-1 w-full">
            <h1 className="font-bold text-[#340406] text-lg sm:text-xl line-clamp-2 truncate whitespace-normal">
              {item.title}
            </h1>
            <h1 className="text-xs sm:text-sm line-clamp-3 truncate whitespace-normal capitalize text-gray-600">
              {item.description}
            </h1>
            {/* <p className="absolute  right-5 bottom-0 font-bold text-xs sm:text-sm line-clamp-3 truncate whitespace-normal capitalize text-gray-600">
              Issued by {item.name}
            </p> */}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col justify-center items-center p-10">
      <div className="max-w-4xl md:w-[calc(80vw-700px)] flex flex-col justify-center items-center gap-10">
        <div className="flex justify-between items-center gap-10 ">
          <h1 className="text-xl font-bold">Your Issues</h1>
          {/* <button
            onClick={handleRefresh}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-150"
          >
            Refresh
          </button> */}
        </div>
        <input
          type="text"
          placeholder="Search by title"
          value={searchQuery}
          onChange={handleSearch}
          className="px-4 py-2 border border-gray-300 rounded-md"
        />

        {issueData ? (
          renderIssues(filteredIssues.length > 0 ? filteredIssues : issueData)
        ) : (
          <div className="text-xl font-bold">Loading...</div>
        )}
      </div>
      <Button className="mt-10 bg-white border-black border hover:bg-black hover:text-white  p-3 rounded-md text-xl font-semibold text-black">
        <Link href="/issues/new">Create new issue</Link>
      </Button>
      <AnimatePresence>
        {
          <Modal isOpen={selectedQuestion !== null}>
            <motion.div
              ref={currentRef}
              layoutId={selectedQuestion}
              variants={singleEval}
              initial={"initial"}
              animate={"enter"}
              exit={"exit"}
              className="relative bg-white text-black rounded-3xl w-full max-w-[1000px] aspect-video p-12"
            >
              <motion.button
                className="absolute right-5 top-5 rounded-full hover:bg-black/10 p-1.5"
                onClick={() => setSelectedQuestion(null)}
              >
                <RxCross2 size={24} />
              </motion.button>
              <form
                onSubmit={handleSubmit(async (data) => {
                  try {
                    const response = await axios.patch(
                      `/api/issues/${selectedQuestionDetails.id}`,
                      data
                    );
                    console.log(response.data);
                    if (response.status === 200) {
                      setIssueData((prevIssues) =>
                        prevIssues.map((issue) =>
                          issue.id === selectedQuestionDetails.id
                            ? { ...issue, ...data }
                            : issue
                        )
                      );
                      toast({
                        title: "Success!",
                        description: "Issue updated successfully.",
                      });
                    }
                  } catch (error) {
                    console.log(error);
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Something went wrong.",
                      description: "There was a problem with your request.",
                    });
                  }
                })}
                className=" flex flex-col justify-center items-center gap-4"
              >
                <Input
                  type="text"
                  className="max-w-lg"
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
                <Button className="mt-5 p-3 text-white font-semibold bg-black rounded-md">
                  Submit issue
                </Button>
              </form>
            </motion.div>
          </Modal>
        }
      </AnimatePresence>
    </div>
  );
};

export default IssuePage;

'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Bot, Send, ArrowRight, User } from "lucide-react";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { answerQuestion, type SupportChatInput } from "@/ai/flows/support-chat";
import { ScrollArea } from "@/components/ui/scroll-area";

const faqItems = [
  {
    question: "How do I add a new patient?",
    answer: "To add a new patient, navigate to the 'Patients' section from the sidebar, and click the 'Add Patient' button. Fill in the required details in the form and click 'Save Patient Record'."
  },
  {
    question: "How can I schedule an appointment?",
    answer: "You can schedule an appointment from the 'Appointments' page by clicking 'Schedule Appointment', or directly from a patient's detail page. Select the patient, doctor, date, and time, then confirm."
  },
  {
    question: "How do I manage staff accounts?",
    answer: "If you are an administrator, you can manage staff accounts in the 'Staff' section. Here you can add new staff members, edit their roles, or deactivate accounts."
  },
  {
    question: "Can I access my medical records as a patient?",
    answer: "Yes. Once you've created a patient account and linked it to your clinic record using your patient ID, you can view your medical history, upcoming appointments, and more under the 'My Records' section."
  },
  {
    question: "What should I do if I forget my password?",
    answer: "On the login page, click the 'Forgot your password?' link. Enter your email address, and we will send you a link to reset your password."
  },
];

type Message = {
    role: 'user' | 'ai';
    content: string;
};

export default function SupportPage() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const chatInput: SupportChatInput = {
                question: input,
                history: messages.map(m => ({ role: m.role, content: m.content })),
            };
            const result = await answerQuestion(chatInput);
            const aiMessage: Message = { role: 'ai', content: result.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI chat error:", error);
            toast({
                title: "AI Assistant Error",
                description: "Sorry, I couldn't process that request. Please try again.",
                variant: "destructive",
            });
            // remove the user message if AI fails
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col gap-8 noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl flex items-center gap-2"><LifeBuoy /> Support Center</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* AI Support Chat */}
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
                        <CardDescription>Ask our AI assistant for help with any questions you have.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col h-[500px]">
                        <ScrollArea className="flex-grow bg-muted/50 rounded-lg p-4 space-y-4" ref={scrollAreaRef}>
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0">
                                    <Bot size={18} />
                                </div>
                                <div className="bg-background p-3 rounded-lg max-w-[80%]">
                                    <p className="text-sm">Hello! I'm the Orelis AI assistant. How can I help you today?</p>
                                </div>
                            </div>
                             {messages.map((message, index) => (
                                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                    {message.role === 'ai' && (
                                        <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0">
                                            <Bot size={18} />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-lg max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                     {message.role === 'user' && (
                                        <div className="p-2 rounded-full bg-muted/80 text-foreground flex-shrink-0">
                                            <User size={18} />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0">
                                        <Bot size={18} />
                                    </div>
                                    <div className="bg-background p-3 rounded-lg max-w-[80%]">
                                       <div className="loading-dots text-primary"><span/><span/><span/></div>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
                            <Input
                                placeholder="Type your message..."
                                className="flex-grow"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <div className="loading-dots"><span/><span/><span/></div> : <Send size={18} />}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                        <CardDescription>Find answers to common questions below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ul className="col-span-full flex flex-col">
                            {faqItems.map((faq) => (
                                <li key={faq.question} className="last:[&>a]:border-b-zinc-800 last:[&>a]:hover:border-b-primary hover:[&_li_a]:border-t-transparent [&:has(+li:hover)>a]:border-b-transparent">
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value={faq.question} className="border-b border-dashed border-zinc-800">
                                            <AccordionTrigger className="group relative -mb-px grid gap-4 py-4 duration-0 hover:z-10 hover:no-underline md:grid-cols-[1fr_auto] md:gap-12 lg:py-6">
                                                <div className="flex flex-col gap-2 text-left">
                                                    <p className="font-mono text-sm leading-snug tracking-tighter text-foreground transition-colors duration-200 group-hover:text-primary lg:text-base">
                                                        {faq.question}
                                                    </p>
                                                </div>
                                                <div className="pointer-events-none relative hidden h-[25px] w-max cursor-pointer items-center justify-center overflow-clip rounded-sm border border-transparent bg-zinc-950 px-3 text-white transition-colors duration-150 group-hover:bg-zinc-800 group-hover:text-white md:ml-auto md:inline-flex">
                                                    <span className="relative z-10 flex items-center gap-1 uppercase">
                                                        <p className="font-mono text-[12px] uppercase leading-[100%] tracking-[-0.015rem]">View</p>
                                                        <ArrowRight className="size-3" />
                                                    </span>
                                                    <div className="pointer-events-none absolute inset-0 opacity-0 will-change-transform group-hover:animate-delayedFadeIn">
                                                        <div className="paused absolute inset-0 animate-slidePattern opacity-100 group-hover:running" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0px, transparent 2px, hsl(var(--primary) / 0.5) 2px, hsl(var(--primary) / 0.5) 3px, transparent 3px, transparent 5px)", backgroundSize: "7.07px 7.07px" }} />
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-6">
                                                <p className="text-muted-foreground">{faq.answer}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Bot, Send, ArrowRight, User, Maximize, X } from "lucide-react";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { askSupportQuestion, type SupportChatInput } from "@/app/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

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

function ChatView({ messages, input, setInput, handleSubmit, isLoading, scrollAreaRef }: {
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
    isLoading: boolean;
    scrollAreaRef: React.RefObject<HTMLDivElement>;
}) {
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }
    }, [messages, scrollAreaRef]);

    return (
        <div className="flex flex-col h-full bg-background">
            <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0">
                        <Bot size={18} />
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg max-w-[80%]">
                        <p className="text-sm">Hello! I'm the Orelis AI assistant. How can I help you today?</p>
                    </div>
                </div>
                 {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 mt-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'ai' && (
                            <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0">
                                <Bot size={18} />
                            </div>
                        )}
                        <div className={`p-3 rounded-lg max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
                            <div className="prose prose-sm prose-invert max-w-none prose-a:text-primary hover:prose-a:underline">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                         {message.role === 'user' && (
                            <div className="p-2 rounded-full bg-muted/80 text-foreground flex-shrink-0">
                                <User size={18} />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 mt-4">
                        <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0">
                            <Bot size={18} />
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg max-w-[80%]">
                           <div className="loading-dots text-primary"><span/><span/><span/></div>
                        </div>
                    </div>
                )}
            </ScrollArea>
            <form onSubmit={handleSubmit} className="p-4 border-t border-dashed flex items-center gap-2 bg-background">
                <Input
                    placeholder="Type your message..."
                    className="flex-grow"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <Button type="submit" isLoading={isLoading} size="icon">
                    <Send size={18} />
                </Button>
            </form>
        </div>
    );
}

export default function SupportPage() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fullScreenScrollAreaRef = useRef<HTMLDivElement>(null);


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
                history: messages,
            };
            const result = await askSupportQuestion(chatInput);
            const aiMessage: Message = { role: 'ai', content: result.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI chat error:", error);
            toast({
                title: "AI Assistant Error",
                description: "Sorry, I couldn't process that request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col gap-8 noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl flex items-center gap-2"><LifeBuoy /> Support Center</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto w-full">
                {/* AI Support Chat */}
                <Card className="border-dashed lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
                            <CardDescription>Ask our AI assistant for help with any questions you have.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(true)}>
                            <Maximize className="w-5 h-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[500px]">
                           <ChatView 
                                messages={messages}
                                input={input}
                                setInput={setInput}
                                handleSubmit={handleSubmit}
                                isLoading={isLoading}
                                scrollAreaRef={scrollAreaRef}
                           />
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card className="border-dashed lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                        <CardDescription>Find answers to common questions below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Accordion type="single" collapsible className="w-full">
                            {faqItems.map((faq) => (
                                <AccordionItem key={faq.question} value={faq.question} className="border-b border-dashed border-zinc-800">
                                    <AccordionTrigger className="text-left hover:no-underline">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-muted-foreground">{faq.answer}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
            <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
                <DialogContent className="max-w-full h-full md:h-[90vh] md:max-w-[80vw] flex flex-col p-0">
                    <DialogHeader className="p-4 border-b border-dashed flex-row items-center justify-between">
                        <DialogTitle className="flex items-center gap-2"><Bot /> AI Support Assistant</DialogTitle>
                    </DialogHeader>
                     <ChatView 
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        scrollAreaRef={fullScreenScrollAreaRef}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

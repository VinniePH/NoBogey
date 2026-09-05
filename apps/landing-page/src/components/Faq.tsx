import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const questions = [
  {
    question: "What is NoBogey?",
    answer: "NoBogey helps golfers discover courses, find caddies, book rounds, and manage their golf plans in one place. It brings the decisions that shape a round into one clear flow, from finding a course to reviewing the final booking details. The platform is also built to give caddies and club teams the information they need to coordinate a great day on the course."
  },
  {
    question: "How do I choose a caddie?",
    answer: "You can review available caddies and compare information such as their experience, specialties, languages, rating, availability, and rate. Select the person who best fits your game and the course you are playing. Before you complete your booking, you can review your chosen caddie alongside the rest of your round details."
  },
  {
    question: "Can I manage my bookings?",
    answer: "Yes. Your upcoming and previous games can be viewed from your bookings area. Each booking keeps the essential details together, including your course, tee time, caddie, and payment status. This gives you one place to check what is coming up and revisit completed rounds."
  },
  {
    question: "Where is NoBogey available?",
    answer: "We’re starting with selected golf destinations and expanding over time. The available courses and caddies shown in NoBogey reflect the locations currently supported on the platform. If your preferred club is not listed yet, you can contact us to share where you would like to see NoBogey next."
  },
  {
    question: "Can golf courses or caddies join NoBogey?",
    answer: "Yes. Courses and caddies who want to learn more can get in touch through our contact page. Send us a short enquiry with your club, location, and the kind of support you are looking for. Our team will receive the message through the NoBogey email address and follow up with the relevant next steps."
  }
];

export function FaqAccordion() {
  return (
    <Accordion.Root className="border-t border-line" type="single" collapsible>
      {questions.map(({ question, answer }, index) => (
        <Accordion.Item className="border-b border-line" key={question} value={`item-${index}`}>
          <Accordion.Header>
            <Accordion.Trigger className="faq-trigger group">
              <span>{question}</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-warm-white transition-colors group-hover:border-forest/30 group-hover:bg-forest/5">
                <ChevronDown className="transition-transform duration-300 group-data-[state=open]:rotate-180" size={16} />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="faq-content">
            <p className="max-w-2xl pb-7 pr-14 text-base leading-7 text-muted">{answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

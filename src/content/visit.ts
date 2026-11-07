/** Visitor information. CALCE and its address are fictional. */

export const museum = {
  name: "CALCE",
  fullName: "CALCE — The Cultural Salon",
  tagline: "A museum of contemporary art, built of stone and light",
  address: ["Via dell'Uliveto 14", "Porto Calce, Mediterranean coast"],
  email: "visit@calce.example",
  phone: "+00 000 000 000",
} as const;

export interface DayHours {
  day: string;
  open: string | null;
  close: string | null;
  note?: string;
}

export const hours: DayHours[] = [
  { day: "Monday", open: null, close: null, note: "Closed" },
  { day: "Tuesday", open: "10:00", close: "18:00" },
  { day: "Wednesday", open: "10:00", close: "18:00" },
  { day: "Thursday", open: "10:00", close: "21:00", note: "Late opening" },
  { day: "Friday", open: "10:00", close: "18:00" },
  { day: "Saturday", open: "10:00", close: "19:00" },
  { day: "Sunday", open: "10:00", close: "19:00" },
];

export const facilities = [
  { title: "Café Limone", text: "Seasonal lunches, coffee and lemon cake under the café's vaulted ceiling, with tables in the sculpture garden from April to October. Open during museum hours; last orders 30 minutes before closing." },
  { title: "Museum shop", text: "Exhibition catalogues, prints and objects made with craftspeople from around the Mediterranean. No ticket is required to visit the shop." },
  { title: "Cloakroom", text: "Free cloakroom beside the reception desk. Large bags, umbrellas and backpacks must be left here before entering the galleries." },
  { title: "Reading room", text: "The artists' notebooks for Salt & Light are reproduced on the table in Gallery III for visitors to handle." },
];

export const accessibility = [
  { title: "Step-free access", text: "Every public space, including the sculpture garden, is on a single level with step-free access from the forecourt. Doorways are at least 3 metres wide." },
  { title: "Seating", text: "Benches are placed in every gallery and around the olive tree in the atrium. Lightweight folding stools are available at reception." },
  { title: "Wheelchairs", text: "Two wheelchairs can be borrowed free of charge from reception; we recommend booking ahead." },
  { title: "Low light", text: "Gallery III and the chamber in Gallery IV are dimly lit to protect the works. Staff can accompany you if you would prefer." },
  { title: "Companions", text: "Companions of visitors with disabilities enter free. Select ‘Companion’ when booking." },
  { title: "Quiet hours", text: "Tuesday mornings from 10:00 to 12:00 are quiet hours, with reduced capacity and no group visits." },
];

export const gettingHere = [
  { mode: "On foot", text: "Ten minutes from the old harbour along the coastal path, signposted from the lighthouse." },
  { mode: "By bus", text: "Lines 4 and 11 stop at ‘Uliveto’, 150 metres from the forecourt gate." },
  { mode: "By bicycle", text: "Covered bicycle racks are inside the forecourt gate, to the left." },
  { mode: "By car", text: "There is no visitor car park. Two accessible bays are reserved at the forecourt gate." },
];

export const faqs = [
  { q: "Do I need to book in advance?", a: "Booking a timed entry is recommended, especially at weekends, but walk-in tickets are sold at reception when capacity allows." },
  { q: "How long should I allow?", a: "Most visitors spend around two hours. The guided tour lasts 60 minutes." },
  { q: "Can I take photographs?", a: "Yes, without flash, for personal use. Photography is not permitted in the darkened chamber of Gallery IV." },
  { q: "Is the digital museum the same as the building?", a: "The 3D museum follows the building's plan and hangs the same works in the same places, so you can plan a visit or revisit a room afterwards." },
];

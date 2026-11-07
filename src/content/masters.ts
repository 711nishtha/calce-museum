import type { Artist } from "./types";

/**
 * Historical artists whose public-domain works are shown in reproduction in Gallery V.
 * Biographies are brief factual summaries; no quotations are attributed to them.
 */
export const masters: Artist[] = [
  {
    id: "diego-velazquez",
    name: "Diego Velázquez",
    born: 1599,
    died: 1660,
    birthplace: "Seville",
    basedIn: "Madrid",
    practice: "Court painter to Philip IV of Spain",
    bio: [
      "Velázquez trained in Seville and moved to Madrid in 1623, where he became painter to King Philip IV and spent the rest of his career at the Spanish court.",
      "His loose, luminous brushwork and his treatment of space and light made him a central figure for later painters, from Goya to Manet.",
    ],
  },
  {
    id: "hans-holbein",
    name: "Hans Holbein the Younger",
    born: 1497,
    died: 1543,
    birthplace: "Augsburg",
    basedIn: "Basel and London",
    practice: "Portraitist to the court of Henry VIII",
    bio: [
      "Holbein worked in Basel before settling in London, where he painted the leading figures of Henry VIII's court and eventually the king himself.",
      "His portraits are known for their exact description of faces, fabrics and objects, often laden with symbolic detail.",
    ],
  },
  {
    id: "hyacinthe-rigaud",
    name: "Hyacinthe Rigaud",
    born: 1659,
    died: 1743,
    birthplace: "Perpignan",
    basedIn: "Paris",
    practice: "State portraits of the French court",
    bio: [
      "Rigaud became the most sought-after portraitist of the French aristocracy, running a large studio in Paris.",
      "His 1701 state portrait of Louis XIV set the pattern for royal portraiture across Europe for the following century.",
    ],
  },
  {
    id: "anthony-van-dyck",
    name: "Anthony van Dyck",
    born: 1599,
    died: 1641,
    birthplace: "Antwerp",
    basedIn: "Antwerp and London",
    practice: "Principal painter to Charles I of England",
    bio: [
      "Van Dyck trained in Antwerp and worked alongside Rubens before travelling in Italy.",
      "From 1632 he was court painter to Charles I in London, where his relaxed yet elegant portraits shaped English portraiture for generations.",
    ],
  },
  {
    id: "elisabeth-vigee-le-brun",
    name: "Élisabeth Vigée Le Brun",
    born: 1755,
    died: 1842,
    birthplace: "Paris",
    basedIn: "Paris",
    practice: "Portraitist to Marie Antoinette",
    bio: [
      "Largely self-taught, Vigée Le Brun became the favoured portraitist of Queen Marie Antoinette and was admitted to the Royal Academy in 1783.",
      "She left France at the Revolution and worked with great success across Europe before returning to Paris.",
    ],
  },
  {
    id: "leonardo-da-vinci",
    name: "Leonardo da Vinci",
    born: 1452,
    died: 1519,
    birthplace: "Vinci, near Florence",
    basedIn: "Florence, Milan and France",
    practice: "Painter, draughtsman and engineer of the Italian Renaissance",
    bio: [
      "Leonardo trained in Florence in the workshop of Verrocchio and worked for patrons in Florence, Milan and Rome, ending his life in France.",
      "Few paintings by him survive; his notebooks of drawings and observations are as celebrated as his pictures.",
    ],
  },
  {
    id: "jan-van-eyck",
    name: "Jan van Eyck",
    born: 1390,
    died: 1441,
    birthplace: "Maaseik (probably)",
    basedIn: "Bruges",
    practice: "Painter to the Duke of Burgundy",
    bio: [
      "Van Eyck served as court painter to Philip the Good, Duke of Burgundy, and worked in Bruges.",
      "His mastery of oil glazes produced a new level of detail and luminosity in Netherlandish painting.",
    ],
  },
  {
    id: "johannes-vermeer",
    name: "Johannes Vermeer",
    born: 1632,
    died: 1675,
    birthplace: "Delft",
    basedIn: "Delft",
    practice: "Interiors and studies of light in the Dutch Golden Age",
    bio: [
      "Vermeer spent his life in Delft and produced a small body of work — around thirty-five paintings are generally accepted.",
      "His quiet interiors are known for their soft daylight and carefully balanced compositions.",
    ],
  },
  {
    id: "raphael",
    name: "Raphael",
    born: 1483,
    died: 1520,
    birthplace: "Urbino",
    basedIn: "Florence and Rome",
    practice: "Painter and architect of the High Renaissance",
    bio: [
      "Raphael worked in Perugia and Florence before Pope Julius II called him to Rome in 1508 to decorate the papal apartments in the Vatican.",
      "His harmonious compositions became a model of classical balance for centuries of academic painting.",
    ],
  },
  {
    id: "sandro-botticelli",
    name: "Sandro Botticelli",
    born: 1445,
    died: 1510,
    birthplace: "Florence",
    basedIn: "Florence",
    practice: "Painter of the Florentine Renaissance",
    bio: [
      "Botticelli worked in Florence for patrons including the Medici and painted frescoes in the Sistine Chapel.",
      "His mythological paintings brought classical subjects to large-scale painting with a distinctive linear grace.",
    ],
  },
  {
    id: "jacques-louis-david",
    name: "Jacques-Louis David",
    born: 1748,
    died: 1825,
    birthplace: "Paris",
    basedIn: "Paris and Brussels",
    practice: "Leading painter of French Neoclassicism",
    bio: [
      "David drew on ancient history and sculpture to create severe, moralising compositions that defined Neoclassicism.",
      "He was active in the French Revolution and later became first painter to Napoleon, ending his life in exile in Brussels.",
    ],
  },
  {
    id: "frederic-leighton",
    name: "Frederic Leighton",
    born: 1830,
    died: 1896,
    birthplace: "Scarborough",
    basedIn: "London",
    practice: "Victorian classicism",
    bio: [
      "Leighton trained across Europe and became President of the Royal Academy in 1878.",
      "His paintings of classical subjects combine academic draughtsmanship with rich colour and decorative design.",
    ],
  },
];

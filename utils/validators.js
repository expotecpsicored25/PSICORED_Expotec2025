// /utils/validators.js
export function isStudentEmail(email) {
  return typeof email === "string" && email.toLowerCase().endsWith("@est.cedesdonbosco.ed.cr");
}
export function isPsychologistEmail(email) {
  return typeof email === "string" && email.toLowerCase().endsWith("@cedesdonbosco.ed.cr");
}
export function getRoleFromEmail(email) {
  if (isStudentEmail(email)) return "student";
  if (isPsychologistEmail(email)) return "psychologist";
  return null;
}

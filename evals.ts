const clicableButtons = () => {
  return Array.from(document.querySelectorAll("div.items-center button"))
    .filter((el) => /.*(Download|Convert).*/i.exec(`${el.textContent}`))
    .forEach((el) => el.click());
};
const queuedButtons = () => {
  return Array.from(
    document.querySelectorAll("div.items-center button"),
  ).filter((el) => /.*(Queued).*/i.exec(`${el.textContent}`));
};

while (queuedButtons().length > 0) {
  clicableButtons();
}

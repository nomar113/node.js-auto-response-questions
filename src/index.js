const { Builder, By, Key, until } = require("selenium-webdriver");
const credentials = require("./credentials.json");
const informations = require("./informations.json");

(async function example() {
  const driver = await new Builder().forBrowser("firefox").build();
  let respostas = [];
  try {
    await driver.get(informations.urlAva);
    await driver
      .findElement(By.name("username"))
      .sendKeys(credentials.matricula, Key.TAB);
    await driver
      .findElement(By.name("password"))
      .sendKeys(credentials.senha, Key.TAB, Key.TAB, Key.SPACE);
    await driver.wait(until.titleIs(informations.title), 600000);
    await driver.sleep(20000);
    const subjects = await driver.findElements(By.css("header > h3"));
    const subjectsLink = await driver.findElements(By.css("footer>div>div>a"));
    const virtualSubjectsLinks = [];

    for (let i = 0; i < subjects.length; i++) {
      const subjectName = await subjects[i].getText();
      const isVirtual = subjectName.startsWith("VIRTUAL");
      if (isVirtual) {
        const subjectLink = await subjectsLink[i].getAttribute("href");
        virtualSubjectsLinks.push(subjectLink);
      }
    }
    let questionsId = [];
    for (let i = 0; i < virtualSubjectsLinks.length; i++) {
      questionsId = [];
      await driver.get(virtualSubjectsLinks[i]);
      await driver.sleep(15000);
      const questions = await driver.findElements(
        By.css("li.activity.quiz.modtype_quiz")
      );
      for (let j = 0; j < questions.length; j++) {
        const questionId = await questions[j].getAttribute("id");
        questionsId.push(questionId.substring("module-".length));
      }
      questionsId.sort();
      const questionsIdSet = new Set(questionsId);
      questionsId = [...questionsIdSet];
      console.log(questionsId.length);
      console.log(questionsId);
      questionsId.pop(); // remove AV1
      console.log(questionsId.length);
      console.log(questionsId);

      removeInvalidQuestions("511344");
      removeInvalidQuestions("511362");
      removeInvalidQuestions("511370");
      removeInvalidQuestions("511374");
      removeInvalidQuestions("511378");
      removeInvalidQuestions("511384");
      removeInvalidQuestions("511388");

      function removeInvalidQuestions(questionId) {
        const index = questionsId.indexOf(questionId);
        if (index > -1) {
          questionsId.splice(index, 1);
        }
      }

      let nota;
      for (id of questionsId) {
        console.log(id);
        await driver.get(informations.urlAvaQuestion + id);
        try {
          nota = await driver
            .findElement(By.css("div#feedback > h3"))
            .getText();
        } catch {
          nota = null;
        }
        while (true) {
          if (nota === informations.grade5 || nota === informations.grade10) {
            break;
          }
          // Continuar tentativa || Tentar novamente
          await driver.findElement(By.tagName("button")).click();
          // Responde questionário
          if (respostas.length > 0) {
            const alternativas = await driver.findElements(
              By.css("label.m-l-1")
            );
            for (let i = 0; i < alternativas.length; i++) {
              for (let j = 0; j < respostas.length; j++) {
                const textoAlternativa = await alternativas[i].getText();
                if (textoAlternativa.includes(respostas[j])) {
                  alternativas[i].click();
                }
              }
            }
          }
          respostas = [];
          // Finalizar tentativa...
          const botaoFinalizarTentativa = await driver.findElement(
            By.name("next")
          );
          console.log(await botaoFinalizarTentativa.isDisplayed());
          while (!(await botaoFinalizarTentativa.isDisplayed())) {
            driver.executeScript(
              "window.scrollTo(0,document.body.scrollHeight);"
            );
          }
          await botaoFinalizarTentativa.click();
          // Enviar tudo e terminar
          const buttons = await driver.findElements(
            By.css("button.btn.btn-secondary")
          );
          buttons[1].click();
          // Enviar tudo e terminar (modal, botão vermelho)
          await driver.sleep(3000);
          try {
            // Só aparece na primeira vez que envia o questionário
            const redButton = await driver.findElement(
              By.css("input.btn.btn-primary")
            );
            redButton.click();
          } catch {
            console.log("Não tem botão vermelho!");
          }
          const rightAnswers = await driver.findElements(
            By.css("div.rightanswer")
          );
          for (let i = 0; i < rightAnswers.length; i++) {
            const respostaHtml = await rightAnswers[i].getText();
            let respostaFormatada = respostaHtml.slice(
              informations.answerRight.length
            );
            respostaFormatada = respostaFormatada.slice(0, -1);
            respostas.push(respostaFormatada);
          }
          console.log("respostas: ");
          console.log(respostas);
          await (
            await driver.findElement(By.linkText(informations.finishRevision))
          ).click();
          nota = await driver
            .findElement(By.css("div#feedback > h3"))
            .getText();
        }
      }
      console.log(nota);
    }
  } finally {
    await driver.quit();
  }
})();

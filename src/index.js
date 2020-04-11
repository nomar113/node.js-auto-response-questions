const { Builder, By, Key, until } = require('selenium-webdriver');
const credentials = require('./credentials.json')

(async function example () {
	let driver = await new Builder().forBrowser('firefox').build();
	let URL_UNICARIOCA = 'http://ava.unicarioca.edu.br';
	let URL_EXERCICIOS = 'https://ava.unicarioca.edu.br/graduacao/mod/quiz/view.php?id=';
	let ID_EXERCICIOS = [508832];
	let matricula = credentials.matricula;
	let senha = credentials.senha;
	try {
		await driver.get(URL_UNICARIOCA);
		await driver.findElement(By.name('username')).sendKeys(matricula, Key.TAB);
		await driver.findElement(By.name('password')).sendKeys(senha, Key.TAB, Key.TAB, Key.SPACE);
		await driver.wait(until.titleIs('UniCarioca Graduação'), 600000);
		for (id of ID_EXERCICIOS) {
			await driver.get(URL_EXERCICIOS + id);
			let nota = null;
			while (nota !== 'Nota mais alta: 5,00 / 5,00.') {
				await driver.findElement(By.tagName('button')).click();
				break;
				nota = await driver.findElement(By.css('div#feedback > h3')).getText();
			}
			console.log(nota)
		}
	} finally {
		// await driver.quit()
	}
})();
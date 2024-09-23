/// <reference types="Cypress" />

const { log } = require('console')

describe('Cypress Playground - Comandos básicos', () => {

  beforeEach(() => {
    cy.visit('https://cypress-playground.s3.eu-central-1.amazonaws.com/index.html')
  })
  
  it('Shows a promotional banner', () => {
    cy.get('#promotional-banner').should('be.visible')
  })

  it('Clicar no botão Subscribe e exibir mensagem de sucesso', () => {
    cy.contains('button', 'Subscribe').should('be.visible')
      .click()
    cy.contains('#success', "You've been successfully subscribed to our newsletter.").should('be.visible')
  });

  it('Digitar o seu nome no primeiro campo “Sign here”', () => {
    const nameD = 'Deivisom Guimarães de Oliveira'
    
    cy.get('#signature-textarea').should('be.visible')
      .type(nameD)
      
    cy.get('#signature').should('be.visible')
      .should('have.text', nameD)
  });

  it('Digitar o seu nome no segundo campo “Sign here” e marcar a caixa de seleção “Show signatures preview”', () => {
    const nameH = 'Henrique Anflor de Oliveira'
    
    cy.get('#signature-textarea-with-checkbox').should('be.visible')
      .type(nameH)
    cy.get('#signature-checkbox').should('be.visible')
      .check()
    cy.get('#signature-triggered-by-check').should('be.visible')
      .contains(nameH)

    cy.get('#signature-checkbox').should('be.visible')
      .uncheck()
      .contains('#signature-triggered-by-check', nameH)
      .should('not.exist')
  });

  it('Marcar os radio buttons On e Off', () => {
    cy.get('#off').should('be.visible') //cy.get('input[type="radio"][value="on"]')
      .check()
    cy.get('#on-off')
      .should('have.text', 'OFF')
    cy.contains('#on-off', 'ON')
      .should('not.exist')

    cy.get('#on').should('be.visible')
      .check()
    cy.get('#on-off')
      .should('have.text', 'ON')
    cy.contains('#on-off', 'OFF')
      .should('not.exist')
  });

  it('Selecionar Basic, Standard ou VIP e certificar de que o tipo correto seja exibido', () => {
    cy.contains('p', "You haven't selected a type yet.").should('be.visible')
    cy.get('#selection-type').should('be.visible')
      .select(3)
    cy.contains('#select-selection', 'VIP').should('be.visible')
  });

  it('Selecionar algumas frutas e certificar que são exibidas corretamente', () => {
    cy.contains('p', "You haven't selected any fruit yet.").should('be.visible')
    cy.get('#fruit').should('be.visible')
      .select(['apple','cherry','date'])
    cy.contains('p', "You've selected the following fruits: apple, cherry, date").should('exist')
  });

  it('Seleciona um arquivo e certificar de que o nome correto do arquivo seja exibido', () => {
    cy.get('input[type="file"]')
      .selectFile('./cypress/fixtures/example.json')

    cy.contains('p', 'The following file has been selected for upload: example.json').should('exist')
  });
})

describe('Cypress Playground - Interceptando requisições', () => {
  
  beforeEach(() => {
    cy.visit('https://cypress-playground.s3.eu-central-1.amazonaws.com/index.html')
  })
  it('Interceptar a requisição acionada ao clicar no botão Get TODO', () => {
    cy.intercept('GET', 'https://jsonplaceholder.typicode.com/todos/1')
      .as('getTodo')

    cy.contains('button', 'Get TODO').should('be.visible')
      .click()
      
    cy.wait('@getTodo')
      .its('response.statusCode')
      .should('be.equal', 200)

    cy.contains('li', 'TODO ID: 1').should('be.visible')
    cy.contains('li', 'Title: delectus aut autem').should('be.visible')
    cy.contains('li', 'Completed: false').should('be.visible')
    cy.contains('li', 'User ID: 1').should('be.visible')
    });

    it('Interceptar a requisição acionada ao clicar no botão Get TODO usando fixture', () => {
      const todo = require('../fixtures/todo.json')

      cy.intercept(
        'GET',
        'https://jsonplaceholder.typicode.com/todos/1',
        { fixture: 'todo' }
      ).as('getTodo')

      cy.contains('button', 'Get TODO').should('be.visible')
      .click()

      cy.wait('@getTodo')
        .its('response.statusCode')
        .should('be.equal', 200)

      cy.contains('li', `TODO ID: ${todo.id}`).should('be.visible')
      cy.contains('li', `Title: ${todo.title}`).should('be.visible')
      cy.contains('li', `Completed: ${todo.completed}`).should('be.visible')
      cy.contains('li', `User ID: ${todo.userId}`).should('be.visible')
    });

    it('Simular uma falha na API', () => {
      cy.intercept(
        'GET',
        'https://jsonplaceholder.typicode.com/todos/1',
        { statusCode: 500 }
      ).as('serverFailure')

      cy.contains('button', 'Get TODO').should('be.visible')
        .click()

      cy.wait('@serverFailure')
        .its('response.statusCode')
        .should('be.equal', 500)

      cy.contains(
        '.error', 
        'Oops, something went wrong. Refresh the page and try again.'
      ).should('be.visible')
    });

    it('Simulando uma falha na rede', () => {
      cy.intercept(
        'GET',
        'https://jsonplaceholder.typicode.com/todos/1',
        { forceNetworkError: true }
      ).as('networkError')

      cy.contains('button', 'Get TODO').should('be.visible')
        .click()

      cy.wait('@networkError')

      cy.contains(
        '.error', 
        'Oops, something went wrong. Check your internet connection, refresh the page, and try again.'
      ).should('be.visible')
    });
});

describe('Cypress Playground - Testes de API', () => {
  it('Realizar uma requisição do tipo GET', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/todos/1')
      .then((response) => {
        expect(response.status).equal(200)
        expect(response.body.completed).equal(false)
        expect(response.body.id).equal(1)
        expect(response.body.userId).equal(1)
        expect(response.body.title).equal('delectus aut autem')
      })
  });
});

describe('Cypress Playground - Outros comandos - parte 1', () => {
  beforeEach(() => {
    cy.visit('https://cypress-playground.s3.eu-central-1.amazonaws.com/index.html')
  })

  Cypress._.times(10, index => {
    it(`Selecionar o range ${ index + 1 } de 10`, () => {
      cy.get('#level').should('be.visible')
        .invoke('val', index + 1)
        .trigger('change')

      cy.contains('p', `You're on level: ${ index + 1 }`).should('be.visible')
    });
  })
  it('Lidando com inputs DATE', () => {
    cy.get('#date').should('be.visible')
      .type('2024-09-23').blur()

    cy.contains('p', "The date you've selected is: 2024-09-23").should('be.visible')
  });
});

describe('Cypress Playground - Protegendo dados sensíveis com Cypress', () => {
  beforeEach(() => {
    cy.visit('https://cypress-playground.s3.eu-central-1.amazonaws.com/index.html')
  })
  it('Protegendo dados sensíveis com Cypress sem vazar a senha', () => {
    cy.get('#password').should('be.visible')
      .type(Cypress.env('password'), {log: false})

    cy.get('#show-password-checkbox').should('be.visible')
      .check()
    cy.get('#password-input input [type="password"]').should('not.exist')
    cy.get('#password-input #password')
      .should('exist')
      .and('have.value', Cypress.env('password'))

    cy.get('#show-password-checkbox').should('be.visible')
      .uncheck()
    cy.get('#password-input #password').should('exist')
    cy.get('#password-input input [type="text"]').should('not.exist')
  });
});

describe('Cypress Playground - Contando itens', () => {
  beforeEach(() => {
    cy.visit('https://cypress-playground.s3.eu-central-1.amazonaws.com/index.html')
  })
  it('Realizar a contagem de itens', () => {
    cy.get('ul#animals li').should('have.length', 5)
  });
});

describe('Cypress Playground - Controlando o tempo', () => {
  beforeEach(() => {
    const now = new Date(Date.UTC(2024, 3, 6)) // Os meses iniciam no índice 0, ou seja, 3 é equivalente ao mês de Abril
    cy.clock(now)
    cy.visit('https://cypress-playground.s3.eu-central-1.amazonaws.com/index.html')
  })
  it('Realizar o controle do tempo - congelando o horário', () => {
    cy.contains ('p', 'Current date: 2024-04-06').should('be.visible')
  });
});

describe('Cypress Playground - Outros comandos - parte 2', () => {
  beforeEach(() => {
    cy.visit('https://cypress-playground.s3.eu-central-1.amazonaws.com/index.html')
  })
  it('Validar dados gerados como entrada de teste - Teste positivo', () => {
    cy.get('#timestamp')
      .then(element => {
        const value = element[0].innerText
        cy.get('#code').should('be.visible')
          .type(value, { delay: 0 })
      })
    cy.contains('button', 'Submit').should('be.visible')
      .click()
    
    cy.contains('span', "Congrats! You've entered the correct code.").should('be.visible')
  });
  
  it('Validar dados gerados como entrada de teste - Teste negativo', () => {
    cy.get('#code').should('be.visible')
      .type('0123456789', { delay: 0 })
    cy.contains('button', 'Submit').should('be.visible')
      .click()
    
    cy.contains('span', "The provided code isn't correct. Please, try again.").should('be.visible')
  });

  it('Testar a leitura de arquivos', () => {
    cy.contains('a', 'Download a text file').should('be.visible')
      .click()
    cy.readFile('cypress/downloads/example.txt')
      .should('be.equal', 'Hello, World!')
  });
});
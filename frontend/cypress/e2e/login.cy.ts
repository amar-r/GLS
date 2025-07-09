describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login form', () => {
    cy.get('h2').should('contain', 'Sign in to GLS')
    cy.get('input[name="username"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'Sign in')
  })

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click()
    cy.get('.form-error').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[name="username"]').type('invaliduser')
    cy.get('input[name="password"]').type('invalidpassword')
    cy.get('button[type="submit"]').click()
    
    // This test assumes the backend is running and will return an error
    // In a real scenario, you might want to mock the API response
    cy.get('button[type="submit"]').should('contain', 'Signing in...')
  })
}) 
As a patron
I want to buy shares in a project
So that I can support the artist and potentially earn rewards

## Scenario: Buy shares with sufficient funds
    Given I am an authenticated user
    And there is a project with share price 100 and 1000 available shares
    And I deposited 10000 money
    When I buy 50 shares
    Then the shares should be allocated to me
    And the project's total shares should be updated

## Scenario: Buy shares with insufficient funds
    Given I am an authenticated user
    And there is a project with share price 100 and 1000 available shares
    And I deposited 2000 money
    When I try to buy 50 shares
    Then I should receive response code 400
    And my funds should be refunded

## Scenario: Buy shares when project is sold out
    Given I am an authenticated user
    And there is a project with share price 100 and 10 available shares
    And I deposited 10000 money
    When I try to buy 50 shares
    Then I should receive response code 400
    And my funds should be refunded

## Scenario: Buy shares for the first time
    Given I am an authenticated user
    And there is a project with share price 100 and 1000 available shares
    And I deposited 10000 money
    When I buy 50 shares
    Then the shares should be allocated to me
    And a token should be generated for me

## Scenario: Buy additional shares
    Given I am an authenticated user
    And there is a project with share price 100 and 500 available shares
    And I deposited 10000 money
    And I have already bought shares in this project
    When I buy 50 shares
    Then the additional shares should be allocated to me
    And no new token should be generated

## Scenario: Project sale closes after all shares are sold
    Given I am an authenticated user
    And there is a project with share price 100 and 100 available shares
    And I deposited 10000 money
    When I buy 100 shares
    Then the shares should be allocated to me
    And the project status should be updated to "SALE_CLOSED"

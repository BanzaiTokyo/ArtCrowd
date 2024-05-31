As a project artist or presenter
I want to post updates to my project
So that I can keep my backers informed

## Scenario: Post a project update as the artist
    Given I am an authenticated user
    And I am the artist for a project
    When I post a new update to the project
    Then I should receive response code 201

## Scenario: Post a project update as the presenter
    Given I am an authenticated user
    And I am the presenter for a project
    When I post a new update to the project
    Then I should receive response code 201

## Scenario: Post a project update as a non-project member
    Given I am an authenticated user
    And I am not the artist or presenter for a project
    When I try to post an update to the project
    Then I should receive response code 403

## Scenario: Post an update too soon after the last update
    Given I am an authenticated user
    And I am the artist for a project
    And I posted an update less than 12 hours ago
    When I try to post an update to the project
    Then I should receive response code 400
    And response contains "You cannot post project updates more often than once in"

## Scenario: Post an update with a file attachment
    Given I am an authenticated user
    And I am the artist for a project
    When I post a new update to the project with a file attachment
    Then the update should be created successfully with the file attached

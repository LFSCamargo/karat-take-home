# Engineering Design Doc Challenge

## Overview

You will write a **design doc** that solves for the below scenario. You are **not** required to implement the whole system.

The goal is to show how you:

- work with ambiguous requirements
- make thoughtful product tradeoffs

- design a system that is implementable, observable, and resilient

## Scenario: Real-time Card Activity + Insights

You are building the first version of a **cardholder activity and insights dashboard** for Karat - this will be the first page cardholders will see when they login.

At minimum, cardholders should be able to:

- View an activity feed of their **card spend**
- See a small set of **metrics** and a lightweight **spend breakdown** (by merchant category)
- Have the data stay reasonably fresh as new activity occurs

Assume the system is powered by a third-party card processor API (**Stripe Issuing**), which exposes CRUD operations for cards, transactions and authorizations.

- Cards API: https://stripe.com/docs/api/issuing/cards
- Authorizations API: https://stripe.com/docs/api/issuing/authorizations
- Transactions API: https://stripe.com/docs/api/issuing/transactions
- Webhooks overview: https://stripe.com/docs/webhooks

## Deliverables

Please provide us with a markdown file or google doc containing the design proposal. Include any diagrams, design mocks, assumptions made, or explanations you find necessary.

Please scaffold a new project in a coding language of your choice to implement your proposed solution. Ideally you’ll have the bare bones of a webapp as we’ll be doing some live coding (and agent prompting) to implement some of your solution during a call with two senior engineers. Please come prepared with your IDE and/or coding agents set up in your preferred way.

Here are some example design docs as a reference, but feel free to use your own

- Wepay: https://github.com/wepay/design_doc_template
- Google Flutter: https://docs.google.com/document/d/1SFRO8U2toOlAaZ38dsuEU7Wm5fn41wvBCWKiwADqfmw/edit?tab=t.0
- Hashicorp: https://www.hashicorp.com/en/how-hashicorp-works/articles/rfc-template

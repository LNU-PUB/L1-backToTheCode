const template = document.createElement('template')
template.innerHTML = `
<div class="behindthename">
  <style>
    .behindthename {
      width: 80%;
      margin: auto;
      background-color: #fff;
      border-radius: 25px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
      padding: 20px;
      margin-bottom: 20px;
    }
    .behindthename form {
      margin-top: 1rem;
      margin-bottom: 1rem;
      margin-left: 3rem;
      margin-right: 3rem;
      display: flex;
      flex-direction: column;
    }
    .behindthename label {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    .behindthename input {
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 1.2rem;
      padding: 0.5rem;
      margin-bottom: 1rem;
    }
    .behindthename button {
      background-color: #000;
      border: 0;
      border-radius: 5px;
      color: #fff;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.5rem;
    }
    .behindthename button:hover {
      background-color: #333;
    }
    .behindthename .name {
      font-size: 1.2rem;
      margin-top: 1rem;
    }
    .behindthename .meaning {
      font-size: 1.2rem;
      margin-top: 1rem;
    }
    .behindthename .error {
      color: red;
      font-size: 1.2rem;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
  </style>
  <form>
              <label for="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Enter name" required>
              <button type="submit">Get info</button>
            </form>
            <div class="name"></div>
            <div class="origins"></div>
            <div class="error"></div>
</div>
`

customElements.define('jk224jv-behindthename',
/**
 * Class representing a behindthename.
 * It gets the name from an input field and then fetches the data from the API.
 * After that it displays the the meaning of the name.
 *
 */
  class extends HTMLElement {
    /**
     * Creates an instance of behindthename.
     */
    constructor () {
      super()

      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      // Set up an event listener on the form element and pass the event to the handleSubmit method.
      this.shadowRoot.querySelector('form').addEventListener('submit', this.handleSubmit.bind(this))

      // Set up an event listener on the button element and pass the event to the handleSubmit method.
      this.shadowRoot.querySelector('button').addEventListener('click', this.handleSubmit.bind(this))

      // Set up the divs so they are ready to display data. And not change the layout when data is displayed.
      this.shadowRoot.querySelector('.name').innerHTML = '&nbsp;'
      this.shadowRoot.querySelector('.error').innerHTML = '&nbsp;'
    }

    /**
     * Check if there is a value for the attribute.
     *
     * @returns {boolean} - True if there is a value for the attribute, false otherwise.
     */
    static get observedAttributes () {
      return ['api-key']
    }

    /**
     * Called when an attribute is changed, appended, removed, or replaced on the element.
     */
    attributeChangedCallback () {
      // We only need the attribute once in the getData method. So we can ignore it here.
    }

    /**
     * Gets the data from the API.
     * If the data is successfully retrieved it is passed to the displayData method.
     * If there is an error it is passed to the displayError method.
     *
     * @param {string} name - The name to get the data for.
     * @returns {Promise} - The promise returned by fetch.
     */
    async getData (name) {
      // Clear the div from any previous data.
      const targetDiv = this.shadowRoot.querySelector('.origins')
      targetDiv.innerHTML = ''
      this.shadowRoot.querySelector('.name').innerHTML = '&nbsp;'
      this.shadowRoot.querySelector('.error').innerHTML = '&nbsp;'

      const apiKey = this.getAttribute('api-key')

      try {
        if (apiKey === '') {
          throw new Error('The API key is missing.')
        }

        const response = await fetch(`https://www.behindthename.com/api/lookup.json?name=${name}&key=${apiKey}`, {
          // eslint-disable-next-line quote-props
          method: 'GET'
        }
        )
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        this.shadowRoot.querySelector('.name').textContent = `The name ${data[0].name} have origin(s) in:`

        // Loop through the origins and add them to the div.
        for (const origin of data[0].usages) {
          const p = document.createElement('p')
          let genderString = ' where is is used by '
          if (origin.usage_gender === 'm') {
            genderString += 'males'
          } else if (origin.usage_gender === 'f') {
            genderString += 'females'
          } else {
            genderString += 'both genders'
          }

          p.textContent = origin.usage_full + ' ' + genderString
          // add a , after each origin except the last one
          if (data[0].usages.indexOf(origin) !== data[0].usages.length - 1) {
            p.textContent += ','
          }
          targetDiv.appendChild(p)
        }
      } catch (error) {
        this.shadowRoot.querySelector('.error').textContent = error.message
        console.log(error)
      }
    }

    /**
     * Handles the submit event.
     *
     * @param {*} event - The form submit event.
     */
    handleSubmit (event) {
      // Prevent the default behavior of the form submit event.
      event.preventDefault()

      // Get the name from the input field.
      const name = this.shadowRoot.querySelector('#name').value

      // Clear any previous error message and result as well as the input field.
      this.shadowRoot.querySelector('.name').innerHTML = '&nbsp;'
      this.shadowRoot.querySelector('.error').innerHTML = '&nbsp;'
      this.shadowRoot.querySelector('#name').value = ''
      this.shadowRoot.querySelector('.origins').innerHTML = '&nbsp;'

      // Do some basic validation of the name.
      if (name.length < 2) {
        this.shadowRoot.querySelector('.error').textContent = 'The name must be at least 2 characters long.'
        return
      }
      // Check if the name contains any invalid characters.
      if (!/^[a-zA-Z]+$/.test(name)) {
        this.shadowRoot.querySelector('.error').textContent = 'The name can only contain letters.'
        return
      }

      // Reset the error message.
      this.shadowRoot.querySelector('.error').textContent = ''

      // Get the data from the API.
      this.getData(name)
    }
  })

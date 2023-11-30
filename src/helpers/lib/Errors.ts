export class BaseError extends Error {
  constructor(message: string) {
    super(message) // Call the parent constructor with the message
    this.name = this.constructor.name // Set the error name to the class name
  }
}

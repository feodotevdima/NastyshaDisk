class User {
    id: string
    name: string;
    email: string;

  
    constructor(name: string, email: string, id: string) {
      this.id = id;
      this.name = name;
      this.email = email;
    }
  }

export default User;
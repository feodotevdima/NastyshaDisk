import React, { useState, useEffect } from 'react';

class File {
    name: string;
    owner: { Id: string, Name: string, Email: string } | null;
    conectedUsers: Array<{ Id: string, Name: string, Email: string }> | null;
  
    constructor(name: string) {
      this.name = name;
      this.owner = null;
      this.conectedUsers = null;
    }
  }

export default File;
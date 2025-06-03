create table login(
    Email varchar(50) primary key NOT NULL,
    password varchar(50) unique NOT NULL,
);
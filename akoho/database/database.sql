CREATE DATABASE poulet;
GO
USE poulet;
GO
CREATE TABLE race (
    id_race INT NOT NULL IDENTITY(1,1) PRIMARY KEY ,
    nom_race VARCHAR(255) NOT NULL ,
    prix_achat DECIMAL(10,2) NOT NULL ,
    prix_vente DECIMAL(10,2) NOT NULL ,
    prix_oeuf DECIMAL(10,2) NOT NULL); 
GO
CREATE TABLE lot (
    id_lot INT NOT NULL IDENTITY(1,1) PRIMARY KEY ,
    id_race INT NOT NULL ,
    age INT NOT NULL ,
    date_creation DATE NOT NULL ,
    nbr_poulet INT NOT NULL ,
    id_couverture INT DEFAULT NULL); 
GO
CREATE TABLE nutrition (
    id_nutrition INT NOT NULL IDENTITY(1,1) PRIMARY KEY ,
    id_race INT NOT NULL); 
GO
CREATE TABLE nutrition_detail (
    id_nutrition_fille INT NOT NULL IDENTITY(1,1) PRIMARY KEY ,
    id_nutrition INT NOT NULL ,
    semaine INT NOT NULL ,
    variation_poids DECIMAL(10,2) NOT NULL ,
    nourriture DECIMAL(10,2) NOT NULL);
GO
CREATE TABLE deces (
    id_deces INT NOT NULL IDENTITY(1,1) PRIMARY KEY ,
    date_deces DATE NOT NULL ,
    id_lot INT NOT NULL ,
    nbr_deces INT NOT NULL);
GO
CREATE TABLE oeufs (
    id_lot_oeufs INT NOT NULL IDENTITY(1,1) PRIMARY KEY ,
    id_lot INT NOT NULL ,
    date_recensement DATE NOT NULL ,
    nbr_oeufs INT NOT NULL); 
GO
CREATE TABLE couverture_oeufs (
    id_couverture INT NOT NULL IDENTITY(1,1) PRIMARY KEY ,
    id_lot_oeufs INT NOT NULL ,
    nbr_oeufs INT NOT NULL ,
    date_couverture DATE NOT NULL);
GO
CREATE TABLE eclosion_oeufs (
    id_eclosion INT NOT NULL IDENTITY(1,1) PRIMARY KEY ,
    date_eclosion DATE NOT NULL ,
    nbr_oeufs_eclos INT NOT NULL ,
    id_couverture INT NOT NULL ,
    id_lot_oeufs INT NOT NULL ,
    nbr_oeufs_pourris INT NOT NULL);
GO

-- ALTER TABLE to add prix_nourriture column
ALTER TABLE race ADD prix_nourriture DECIMAL(10,2) NOT NULL DEFAULT 0;
GO

-- ALTER TABLE to add poids_initial column
ALTER TABLE lot ADD poids_initial DECIMAL(10,2) NOT NULL DEFAULT 0;
GO
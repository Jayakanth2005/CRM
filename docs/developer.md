# Developer Guide - Fastor7 CRM Backend

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Setup](#development-setup)
4. [Database Schema](#database-schema)
5. [Code Structure](#code-structure)
6. [Testing](#testing)
7. [Contributing Guidelines](#contributing-guidelines)
8. [Troubleshooting](#troubleshooting)

## Project Overview

The Fastor7 CRM Backend is a Node.js REST API built with clean architecture principles. It manages employee authentication, lead enquiries, and provides a comprehensive lead management system.

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose

### Key Features
- Employee registration and authentication
- Public enquiry form submission
- Lead claiming and management
- Rate limiting and security middleware
- Comprehensive test coverage
- Clean architecture with separation of concerns

## Architecture

### Clean Architecture Layers


# Project Name: Snack/Drink/Milk Tea Selling Website

## Description
This project is a website for selling snacks, drinks, and milk tea with features to manage products, orders, and user login to save order history. It leverages Cloudflare Worker as the serverless backend and Cloudflare R2 to store images and data for cost-efficient operation.

## Main Features
- Admin page: Manage products, orders, images, cutomers
- User page: View product list and product details
- Order placement without payment, users can optionally register/login to save order history
- Save order history when users log in

## Technologies Used
- Backend: Cloudflare Worker (Serverless)
- Storage for images and data: Cloudflare R2
- Frontend: Vue
- Temporary order storage or cache: Worker KV

## Installation and Running
1. Install Cloudflare Wrangler CLI tool
2. Configure project with Cloudflare account info, R2 bucket
3. Build frontend (if any)
4. Deploy backend using `wrangler publish`
5. Configure DNS or Cloudflare Pages for frontend hosting

## Folder Structure (Example)
```
/frontend # Frontend source code (React or Vue)
/backend # Static assets (images, icons)
/scripts # Build and deploy support scripts
```


## Development Workflow
- Use Git for source control
- Pull requests and code reviews before merge
- CI/CD pipeline if needed

## Usage Guide
- Admin logs in to manage products and orders
- Users browse products, add to cart, place orders
- Users register/login to view order history

## Contact
Developer or organization name  
Email: example@mail.com  
Phone: 0123456789

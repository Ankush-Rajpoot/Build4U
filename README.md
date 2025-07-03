# 🔧 BuildForYou - Professional Service Marketplace

**BuildForYou** is a comprehensive full-stack web application that connects clients with skilled workers for various service requests. Whether you need plumbing, electrical work, carpentry, or any other professional service, BuildForYou provides a seamless platform for service discovery, booking, and management.

## 🌟 Key Features

### For Clients
- **Service Request Management**: Create, edit, and track service requests with detailed descriptions
- **Worker Discovery**: Browse available skilled workers based on location and expertise
- **Real-time Proposals**: Receive and review proposals from interested workers
- **Secure Communication**: Built-in messaging system for direct worker communication
- **Review System**: Rate and review completed services to help other clients
- **Dashboard Analytics**: Track spending, active jobs, and service history
- **Profile Management**: Comprehensive profile with contact information and preferences

### For Workers
- **Job Marketplace**: Browse and apply for available service requests
- **Professional Profiles**: Showcase skills, experience, and hourly rates
- **Proposal System**: Submit competitive proposals with custom pricing
- **Earnings Tracking**: Monitor total earnings and job completion statistics
- **Rating System**: Build reputation through client reviews and ratings
- **Availability Management**: Control work availability and job preferences
- **Performance Analytics**: Detailed metrics on work quality, communication, and timeliness

### Core Platform Features
- **Real-time Notifications**: Instant updates on job status, messages, and proposals
- **Advanced Search & Filtering**: Find services or workers by location, skills, and availability
- **Secure Authentication**: Email verification and role-based access control
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **File Upload Support**: Share images and documents for service requests
- **Review & Rating System**: Comprehensive feedback mechanism with detailed metrics

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and functional components
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Headless UI** - Unstyled, accessible UI components
- **Lucide React** - Beautiful, customizable SVG icons
- **React Router** - Client-side routing and navigation
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Elegant MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for secure authentication
- **Bcrypt** - Password hashing for security
- **Nodemailer** - Email sending for notifications
- **Cloudinary** - Cloud-based image and video management
- **Multer** - Middleware for handling file uploads

### Development Tools
- **ESLint** - Code linting and style enforcement
- **PostCSS** - CSS processing and optimization
- **Git** - Version control system
- **Nodemon** - Development server with auto-restart

## 📁 Project Structure

```
BuildForYou/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── client/         # Client-specific components
│   │   │   ├── worker/         # Worker-specific components
│   │   │   ├── shared/         # Reusable components
│   │   │   ├── messaging/      # Chat and messaging
│   │   │   ├── notifications/  # Notification system
│   │   │   └── reviews/        # Review and rating components
│   │   ├── context/            # React context providers
│   │   ├── services/           # API service layers
│   │   ├── assets/             # Static assets
│   │   └── data/               # Mock data and constants
│   ├── public/                 # Public static files
│   └── package.json            # Frontend dependencies
├── backend/
│   ├── controllers/            # Route handlers and business logic
│   ├── models/                 # MongoDB schemas and models
│   ├── routes/                 # API route definitions
│   ├── middleware/             # Custom middleware functions
│   ├── services/               # Business service layers
│   ├── utils/                  # Utility functions and helpers
│   ├── config/                 # Configuration files
│   ├── cron/                   # Scheduled tasks and jobs
│   └── package.json            # Backend dependencies
├── .env                        # Environment variables
├── README.md                   # Project documentation
└── package.json                # Root package configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/buildloryou.git
   cd buildloryou
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/buildloryou
   
   # JWT Secret
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=30d
   
   # Email Configuration (for verification)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   
   # Cloudinary (for file uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Application URLs
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**

   **Option 1: Start both servers simultaneously**
   ```bash
   # From the root directory
   npm run dev
   ```

   **Option 2: Start servers separately**
   ```bash
   # Terminal 1 - Backend server
   cd backend
   npm run dev

   # Terminal 2 - Frontend server
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📊 Database Schema

### User Models

#### Client Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: { latitude: Number, longitude: Number }
  },
  profileImage: String,
  isVerified: Boolean,
  totalSpent: Number,
  completedJobs: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Worker Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  location: Object,
  skills: [String],
  experience: String,
  hourlyRate: Number,
  availability: String,
  rating: {
    average: Number,
    count: Number
  },
  earnings: {
    total: Number,
    thisMonth: Number
  },
  completedJobs: Number,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Service Models

#### Service Request Schema
```javascript
{
  title: String,
  description: String,
  category: String,
  budget: Number,
  urgency: String,
  location: Object,
  images: [String],
  client: ObjectId (ref: Client),
  worker: ObjectId (ref: Worker),
  status: String, // pending, accepted, in-progress, completed, cancelled
  proposedDate: Date,
  completionDate: Date,
  proposals: [ObjectId] (ref: Proposal),
  review: ObjectId (ref: Review),
  createdAt: Date,
  updatedAt: Date
}
```

#### Review Schema
```javascript
{
  serviceRequest: ObjectId (ref: ServiceRequest),
  client: ObjectId (ref: Client),
  worker: ObjectId (ref: Worker),
  rating: Number,
  workQuality: Number,
  communication: Number,
  timeliness: Number,
  professionalism: Number,
  wouldRecommend: Boolean,
  comment: String,
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/clients/register` - Client registration
- `POST /api/clients/login` - Client login
- `POST /api/workers/register` - Worker registration
- `POST /api/workers/login` - Worker login
- `GET /api/clients/verify` - Email verification
- `GET /api/workers/verify` - Email verification

### Service Requests
- `GET /api/service-requests` - Get all service requests
- `POST /api/service-requests` - Create new service request
- `PUT /api/service-requests/:id` - Update service request
- `DELETE /api/service-requests/:id` - Delete service request
- `GET /api/service-requests/client` - Get client's requests
- `GET /api/service-requests/worker` - Get worker's jobs

### Profiles & Statistics
- `GET /api/clients/profile` - Get client profile
- `PUT /api/clients/profile` - Update client profile
- `GET /api/clients/stats` - Get client statistics
- `GET /api/workers/profile` - Get worker profile
- `PUT /api/workers/profile` - Update worker profile
- `GET /api/workers/stats` - Get worker statistics

### Reviews & Ratings
- `POST /api/reviews` - Create review
- `GET /api/reviews/client/:id` - Get client reviews
- `GET /api/reviews/worker/:id` - Get worker reviews
- `PUT /api/reviews/:id` - Update review

### Real-time Features
- `WebSocket /socket.io` - Real-time messaging and notifications

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Blue primary for clients, Green primary for workers
- **Typography**: Clean, professional fonts with clear hierarchy
- **Layout**: Responsive grid system with mobile-first approach
- **Icons**: Consistent Lucide React icon set throughout the application
- **Components**: Reusable, accessible components with proper ARIA labels

### User Experience
- **Intuitive Navigation**: Clear sidebar navigation with active states
- **Loading States**: Skeleton loaders and spinners for better perceived performance
- **Error Handling**: User-friendly error messages and retry mechanisms
- **Success Feedback**: Confirmation messages and visual feedback for actions
- **Search & Filtering**: Advanced filtering options with real-time results
- **Responsive Design**: Seamless experience across all device sizes

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Secure token-based authentication with expiration
- **Email Verification**: Account verification before full access
- **Input Validation**: Server-side validation for all user inputs
- **File Upload Security**: Cloudinary integration with file type restrictions
- **SQL Injection Prevention**: MongoDB and Mongoose ORM protection
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 📱 Mobile Responsiveness

BuildForYou is fully responsive and optimized for:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Adapted layout with collapsible navigation
- **Mobile**: Touch-optimized interface with bottom navigation
- **Progressive Web App**: Can be installed on mobile devices

## 🚀 Deployment

### Production Build
```bash
# Build frontend for production
cd frontend
npm run build

# Build backend for production
cd ../backend
npm run build
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_super_secure_production_jwt_secret
EMAIL_HOST=your_production_email_host
CLOUDINARY_CLOUD_NAME=your_production_cloudinary_name
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### Deployment Platforms
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Heroku, DigitalOcean, AWS EC2, or Railway
- **Database**: MongoDB Atlas, AWS DocumentDB, or DigitalOcean Managed MongoDB


### FUTURE:->

## 🐳 DevOps & Cloud Infrastructure

### Containerization with Docker
<!-- 
BuildForYou is fully containerized for consistent deployment across environments. -->

#### Docker Configuration

**Frontend Dockerfile**
```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
USER node
CMD ["npm", "start"]
```

**Docker Compose for Local Development**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/buildloryou
    depends_on:
      - mongo
    volumes:
      - ./backend:/app
      - /app/node_modules

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=buildloryou

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

### 🚀 AWS Cloud Architecture

#### Production Infrastructure on AWS

**Core Services Architecture**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   S3 Bucket      │    │   Route 53      │
│   (CDN)         │    │   (Frontend)     │    │   (DNS)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Application     │    │   API Gateway    │    │   Certificate   │
│ Load Balancer   │────│   (REST API)     │    │   Manager (SSL) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Auto Scaling  │    │   Lambda         │
│   Group (EC2)   │    │   Functions      │
└─────────────────┘    └──────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   RDS (MongoDB) │    │   ElastiCache    │
│   DocumentDB    │    │   (Redis)        │
└─────────────────┘    └──────────────────┘
```

#### AWS Services Integration

**1. 🌐 Frontend Hosting & CDN**
- **S3 Bucket**: Static website hosting for React build files
- **CloudFront**: Global CDN for fast content delivery
- **Route 53**: DNS management and domain routing
- **Certificate Manager**: SSL/TLS certificates for HTTPS

**2. 🖥️ Backend Infrastructure**
- **EC2 Instances**: Scalable compute instances for Node.js backend
- **Auto Scaling Groups**: Automatic scaling based on demand
- **Application Load Balancer**: Distributes traffic across instances
- **API Gateway**: RESTful API management and throttling

**3. 🗄️ Database & Storage**
- **DocumentDB**: MongoDB-compatible managed database
- **RDS**: Alternative relational database option
- **S3**: File storage for images, documents, and backups
- **ElastiCache**: Redis-based caching for session management

**4. 🔐 Security & Monitoring**
- **IAM**: Identity and access management
- **VPC**: Virtual private cloud for network isolation
- **Security Groups**: Firewall rules for EC2 instances
- **CloudWatch**: Monitoring, logging, and alerting
- **AWS WAF**: Web application firewall protection

**5. 🔄 CI/CD Pipeline**
- **CodePipeline**: Automated deployment pipeline
- **CodeBuild**: Build and test automation
- **CodeDeploy**: Application deployment automation
- **GitHub Actions**: Alternative CI/CD with AWS integration

#### IAM Roles & Policies

**EC2 Instance Role**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::buildloryou-uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

**S3 Bucket Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::buildloryou-frontend/*"
    },
    {
      "Sid": "CloudFrontOriginAccessIdentity",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::buildloryou-frontend/*"
    }
  ]
}
```

### 📦 Infrastructure as Code (IaC)

#### Terraform Configuration

**Main Infrastructure**
```hcl
# Provider configuration
provider "aws" {
  region = var.aws_region
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "buildloryou-vpc"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "buildloryou-public-${count.index + 1}"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "buildloryou-private-${count.index + 1}"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "buildloryou-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false
}

# Auto Scaling Group
resource "aws_autoscaling_group" "backend" {
  name                = "buildloryou-asg"
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.backend.arn]
  health_check_type   = "ELB"
  min_size            = 2
  max_size            = 10
  desired_capacity    = 3

  launch_template {
    id      = aws_launch_template.backend.id
    version = "$Latest"
  }
}
```

#### AWS CloudFormation Alternative

**CloudFormation Template (buildloryou-infrastructure.yaml)**
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'BuildForYou Production Infrastructure'

Parameters:
  EnvironmentName:
    Description: Environment name prefix
    Type: String
    Default: buildloryou

Resources:
  # VPC Configuration
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-VPC

  # S3 Bucket for Frontend
  FrontendBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub ${EnvironmentName}-frontend
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: error.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false

  # CloudFront Distribution
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: !GetAtt FrontendBucket.RegionalDomainName
            Id: S3Origin
            S3OriginConfig:
              OriginAccessIdentity: !Sub origin-access-identity/cloudfront/${CloudFrontOriginAccessIdentity}
        Enabled: true
        DefaultRootObject: index.html
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
          CachedMethods:
            - GET
            - HEAD
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
```

### 🔄 CI/CD Pipeline

#### GitHub Actions Workflow

**.github/workflows/deploy.yml**
```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: buildloryou
  ECS_SERVICE: buildloryou-service
  ECS_CLUSTER: buildloryou-cluster

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
      
      - name: Run tests
        run: |
          cd frontend && npm test
          cd ../backend && npm test
      
      - name: Run linting
        run: |
          cd frontend && npm run lint
          cd ../backend && npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          # Build and push backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:backend-$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:backend-$IMAGE_TAG
          
          # Build and push frontend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:frontend-$IMAGE_TAG ./frontend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:frontend-$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment

      - name: Deploy frontend to S3
        run: |
          cd frontend
          npm run build
          aws s3 sync dist/ s3://buildloryou-frontend --delete
          
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

### 📊 Monitoring & Observability

#### CloudWatch Configuration

**Custom Metrics Dashboard**
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "buildloryou-alb"],
          ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "buildloryou-alb"],
          ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "buildloryou-asg"],
          ["AWS/DocumentDB", "DatabaseConnections", "DBClusterIdentifier", "buildloryou-docdb"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Application Performance"
      }
    }
  ]
}
```

#### Application Monitoring

**Health Check Endpoints**
```javascript
// backend/routes/health.js
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  };
  
  res.status(200).json(healthCheck);
});

app.get('/health/detailed', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Check Redis connection
    await redisClient.ping();
    
    res.status(200).json({
      status: 'healthy',
      services: {
        database: 'connected',
        redis: 'connected',
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 🔧 DevOps Best Practices

#### 1. **Security Hardening**
- Regular security updates and patches
- Secrets management with AWS Secrets Manager
- Network segmentation with VPC and Security Groups
- SSL/TLS encryption for all communications
- Regular security audits and penetration testing

#### 2. **Backup & Disaster Recovery**
- Automated database backups with point-in-time recovery
- Cross-region backup replication
- Infrastructure as Code for quick recovery
- Regular disaster recovery testing

#### 3. **Performance Optimization**
- Auto-scaling based on CPU and memory metrics
- Content delivery through CloudFront CDN
- Database query optimization and indexing
- Redis caching for frequently accessed data
- Image optimization and compression

#### 4. **Cost Optimization**
- Reserved instances for predictable workloads
- Spot instances for non-critical tasks
- S3 lifecycle policies for old data
- Regular cost analysis and optimization reviews

#### 5. **Compliance & Governance**
- AWS Config for compliance monitoring
- CloudTrail for audit logging
- Regular compliance assessments
- Data retention and privacy policies

## 🤝 Contributing

We welcome contributions to BuildForYou! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features when applicable
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📞 Support & Contact
<!-- 
- **Documentation**: [Link to full documentation]
- **Issues**: [GitHub Issues](https://github.com/yourusername/buildloryou/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/buildloryou/discussions)
- **Email**: support@buildloryou.com -->

## 📄 License
<!-- 
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

## 🙏 Acknowledgments

- **React Team** - For the amazing React library
- **Tailwind CSS** - For the utility-first CSS framework
- **MongoDB** - For the flexible NoSQL database
- **Cloudinary** - For image and video management
- **All Contributors** - Thank you for your contributions!

---

**BuildForYou** - Connecting skills with needs, building communities one service at a time. 🔧✨

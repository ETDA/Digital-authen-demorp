FROM node:14-alpine
RUN apk update && apk upgrade && apk add --no-cache bash git openssh
WORKDIR /app

# Copy the current directory contents into the container at /app
#COPY package*.json /app/

#RUN npm install

COPY . /app
RUN npm install
#ENV PORT=3000

# By default, run node server.js when the container launches
#CMD ["npm", "start"]
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
morgan('tiny')

const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan())
app.use(cors())

app.get('/info', (request, response) => {
    const time = new Date()

    Person.find({}).then(persons => {
        const responseString =
            `<p>Phonebook has info for ${persons.length} people</p>
    <p>${time}</p>`
        response.send(responseString)
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }

    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    // if (!body.name || !body.number) {
    //     return response.status(400).json({
    //         error: 'Name or number cannot be missing'
    //     })
    // }

    const person = new Person({
        ...body
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    // if (!body.name || !body.number) {
    //     return response.status(400).json({
    //         error: 'Name or number cannot be missing'
    //     })
    // }

    Person.findByIdAndUpdate(
        request.params.id,
        { ...body },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        }
        ).catch(error => {
            console.log(error)
            next(error)
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

let port = process.env.PORT;
if (port == null || port == '') {
  port = 8008;
}

app.listen(port, () => console.log(`server opened on port ${port}`));

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

mongoose.connect('mongodb+srv://admin-stephen:test123@cluster0-ydita.mongodb.net/tuesdayDotComDB', { useNewUrlParser: true, useUnifiedTopology: true });

const jobSchema = new mongoose.Schema({
  task: String,
  department: String,
  priority: String,
  comment: [
    {
      commentText: String,
    },
  ],
});

const Job = mongoose.model('Job', jobSchema);

app.get('/', (req, res) => {
  res.send(`pretty fly for a white guy`);
});

app
  .route('/jobs')
  .get((req, res) => {
    Job.find((err, foundJobs) => {
      if (!err) {
        res.send(foundJobs);
      } else {
        res.send(err);
      }
    });
  })
  .post((req, res) => {
    const job = new Job({
      task: req.body.task,
      department: req.body.department,
      priority: req.body.priority,
    });
    job.save((err) => {
      if (!err) {
        res.send('successfully added a new job');
      } else {
        res.send(`oops, something went wrong. ${err}`);
      }
    });
  })
  .delete((req, res) => {
    Job.deleteMany((err) => {
      if (!err) {
        res.send('successfully deleted all jobs');
      } else {
        res.send(`oops, something went wrong. ${err}`);
      }
    });
  });

app
  .route('/jobs/:jobID')
  .get((req, res) => {
    const jobReq = req.params.jobID;
    Job.findOne({ _id: jobReq }, (err, foundJob) => {
      if (foundJob) {
        res.send(foundJob);
      } else {
        res.send('there are no jobs that match that title.');
      }
    });
  })
  .patch((req, res) => {
    const jobReq = req.params.jobID;
    Job.findOneAndUpdate({ _id: jobReq }, { $push: { comment: { commentText: req.body.comment } } }, { useFindAndModify: false }, (err) => {
      if (!err) {
        res.send(`job: ${jobReq}, has been updated`);
      } else {
        res.send(err);
      }
    });
  })
  .delete((req, res) => {
    const jobReq = req.params.jobID;
    Job.deleteOne({ _id: jobReq }, (err) => {
      if (!err) {
        res.send(`successfully deleted the ${jobReq} job`);
      } else {
        res.send(err);
      }
    });
  });

app.route('/jobs/:jobID/:commentID').delete((req, res) => {
  const jobReq = req.params.jobID;
  const commentReq = req.params.commentID;
  Job.findOneAndUpdate({ _id: jobReq }, { $pull: { comment: { _id: commentReq } } }, { useFindAndModify: false }, (err) => {
    if (!err) {
      res.send(`job: ${jobReq}, has been updated`);
    } else {
      res.send(err);
    }
  });
});

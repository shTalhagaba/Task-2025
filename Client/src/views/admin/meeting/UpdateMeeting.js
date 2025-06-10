import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApi, putApi, postApi } from 'services/api';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, Heading, Text } from '@chakra-ui/react';

const UpdateMeeting = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const response = await getApi(`api/meeting/view/${id}`);
                setMeeting(response.data);
            } catch (error) {
                console.error('Error fetching meeting:', error);
                toast.error('Failed to fetch meeting details');
            } finally {
                setLoading(false);
            }
        };

        fetchMeeting();
    }, [id]);

    const validationSchema = Yup.object({
        agenda: Yup.string().required('Agenda is required'),
        location: Yup.string().required('Location is required'),
        dateTime: Yup.date().required('Date and time are required'),
        notes: Yup.string(),
    });

    const handleSubmit = async (values) => {
        try {
            const response = await postApi(`api/meeting/update/${id}`, values);
            if (response.status === 200) {
                toast.success('Meeting updated successfully');
                navigate('/meeting');
            } else {
                toast.error('Failed to update meeting');
            }
        } catch (error) {
            console.error('Error updating meeting:', error);
            toast.error('Failed to update meeting');
        }
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box p={5}>
            <Heading mb={5}>Update Meeting</Heading>
            <Formik
                initialValues={{
                    agenda: meeting?.agenda || '',
                    location: meeting?.location || '',
                    dateTime: meeting?.dateTime || '',
                    notes: meeting?.notes || '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched }) => (
                    <Form>
                        <VStack spacing={4} align="stretch">
                            <FormControl isInvalid={errors.agenda && touched.agenda}>
                                <FormLabel>Agenda</FormLabel>
                                <Field as={Input} name="agenda" />
                                {errors.agenda && touched.agenda && <Text color="red">{errors.agenda}</Text>}
                            </FormControl>
                            <FormControl isInvalid={errors.location && touched.location}>
                                <FormLabel>Location</FormLabel>
                                <Field as={Input} name="location" />
                                {errors.location && touched.location && <Text color="red">{errors.location}</Text>}
                            </FormControl>
                            <FormControl isInvalid={errors.dateTime && touched.dateTime}>
                                <FormLabel>Date and Time</FormLabel>
                                <Field as={Input} type="datetime-local" name="dateTime" />
                                {errors.dateTime && touched.dateTime && <Text color="red">{errors.dateTime}</Text>}
                            </FormControl>
                            <FormControl>
                                <FormLabel>Notes</FormLabel>
                                <Field as={Textarea} name="notes" />
                            </FormControl>
                            <Button type="submit" colorScheme="blue">Update Meeting</Button>
                        </VStack>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default UpdateMeeting; 
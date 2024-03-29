import "./OrderList.css";
import { DataGrid } from "@material-ui/data-grid";
import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { axiosInstance } from "../../utils/base";

import { withSnackbar } from "notistack";
import moment from "moment";
import CircularIndeterminate from "../../components/CircularIndeterminate/CircularIndeterminate";

const useStyles = makeStyles({

    dataGrid: {
        width: "100%",
        marginTop: '30px'
    },
});

function OrderList(props) {
    const classes = useStyles();
    const [data, setData] = useState([]);
    // const [editId, setEditId] = useState(null);
    // const [showEditDialog, setShowEditDialog] = useState(false);
    // const [showAddDialog, setShowAddDialog] = useState(false);
    const [loadingBar, setLoadingBar] = useState(false);

    useEffect(function () {
        async function loadNewMembers() {
            setLoadingBar(true);
            const res = await axiosInstance.get('/orders?limit=999&sort_type=asc');
            setLoadingBar(false);
            if (res.data.courseOrders) {
                let orders = res.data.courseOrders.map((el) => {
                    el['course_order']['user_fullname'] = el['user']['fullname'];
                    el['course_order']['course_name'] = el['course']['name'];
                    el['course_order']['enroll_at'] = moment(el['course_order']['enroll_at']).format('YYYY-MM-DD');
                    delete el['user'];
                    delete el['course']
                    return el['course_order'];
                });
                console.log(orders)
                setData(orders);
            }
        }

        loadNewMembers();
    }, []);

    const handleDelete = async (id) => {
        try {
            setLoadingBar(true);
            const res = await axiosInstance.delete(`/orders/${id}`);
            setLoadingBar(false);
            console.log(data)
            if (res.status === 200) {
                props.enqueueSnackbar('Successfully deleted user', { variant: 'success' });
                setData(data.filter((item) => item.id !== id));
            } else {
                props.enqueueSnackbar('Failed done the operation.', { variant: 'error' });
            }

        } catch (err) {
            props.enqueueSnackbar('Failed done the operation', { variant: 'error' });
        }
    };

    // const handleEdit = (id) => {
    //     setEditId(id);
    //     setShowEditDialog(true);
    // };

    const columns = [
        { field: "id", headerName: "ID", flex: 0.15 },
        {
            field: "course_name",
            headerName: "Course",
            flex: 0.3,
        },
        {
            field: "user_fullname",
            headerName: "User",
            flex: 0.3,
        },
        {
            field: "enroll_at",
            headerName: "Enroll at",
            flex: 0.3,
        },
        {
            field: "action",
            headerName: "Action",
            flex: 0.2,
            renderCell: (params) => {
                return (
                    <>
                        {/* <button className="buttonEdit" variant="contained"
                            onClick={() => handleEdit(params.row.id)}>Edit
                        </button> */}

                        <button className="buttonDelete" variant="contained"
                            onClick={() => handleDelete(params.row.id)}>Delete
                        </button>
                    </>
                );
            },
        },
    ];

    return (
        <div className="orderList">
            <h1>Order List</h1>
            {loadingBar ? <CircularIndeterminate /> :
                <DataGrid className={classes.dataGrid}
                    rows={data}
                    disableSelectionOnClick
                    columns={columns}
                    pageSize={8}
                    checkboxSelection
                    autoHeight={true}
                >

                </DataGrid>
            }
            {/* <Dialog open={true} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                <DialogContent>
                    <User id={id} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Subscribe
                    </Button>
                </DialogActions>
            </Dialog> */}
            {/* {showEditDialog && <EditUser id={editId} toggle={() => setShowEditDialog(false)} />}
            {showAddDialog && <NewUser toggle={() => setShowAddDialog(false)} />} */}
            {/* {showEditDialog && <EditCourse handle={handleEditOnClick} id={editId} toggle={() => setShowEditDialog(false)} />}
            {showAddDialog && <NewCourse handle={handleAddOnClick} toggle={() => setShowAddDialog(false)} />} */}

        </div >
    );


}

export default withSnackbar(OrderList);
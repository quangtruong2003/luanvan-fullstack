-- Initial Schema Setup

-- Drop existing tables if they exist to ensure a clean start
drop table if exists appointments;
drop table if exists articles;
drop table if exists availability_slots;
drop table if exists clinics;
drop table if exists doctor_specialty;
drop table if exists doctors;
drop table if exists payments;
drop table if exists roles;
drop table if exists specialties;
drop table if exists standard_work_shifts;
drop table if exists system_configuration;
drop table if exists users;

-- Create tables
create table appointments (
    deposit_amount decimal(10,2), 
    is_deposit_non_refundable bit not null, 
    is_deposit_paid bit not null, 
    appointment_date_time datetime(6), 
    appointment_id bigint not null auto_increment, 
    booking_timestamp datetime(6), 
    cancellation_timestamp datetime(6), 
    clinic_id bigint, 
    doctor_id bigint, 
    patient_id bigint, 
    payment_timestamp datetime(6), 
    slot_id bigint, 
    specialty_id bigint, 
    cancellation_reason TEXT, 
    payment_transaction_id varchar(255), 
    reason_for_visit TEXT, 
    payment_status_momo enum ('CANCELLED','FAILED','PENDING','SUCCESS'), 
    status enum ('CANCELLED_BY_CLINIC','CANCELLED_BY_PATIENT','COMPLETED','CONFIRMED','NO_SHOW','PAYMENT_FAILED','PENDING_PAYMENT'), 
    primary key (appointment_id)
) engine=InnoDB;

create table articles (
    article_id bigint not null auto_increment, 
    author_id bigint, 
    last_modified_date datetime(6), 
    published_date datetime(6), 
    category varchar(255), 
    content TEXT, 
    imageurl varchar(255), 
    title varchar(255), 
    status enum ('ARCHIVED','DRAFT','PUBLISHED'), 
    primary key (article_id)
) engine=InnoDB;

create table availability_slots (
    auto_generated bit, 
    date date, 
    end_time time(6), 
    slot_duration_minutes integer, 
    start_time time(6), 
    clinic_id bigint, 
    created_from_shift_id bigint, 
    doctor_id bigint, 
    slot_id bigint not null auto_increment, 
    specialty_id bigint, 
    notes TEXT, 
    status enum ('AVAILABLE','BOOKED','CANCELLED_BY_CLINIC','ON_LEAVE'), 
    primary key (slot_id)
) engine=InnoDB;

create table clinics (
    clinic_id bigint not null auto_increment, 
    address varchar(255), 
    core_values TEXT, 
    description TEXT, 
    email varchar(255), 
    equipment_description TEXT, 
    facilities_description TEXT, 
    history TEXT, 
    logourl varchar(255), 
    mission TEXT, 
    name varchar(255), 
    phone_number varchar(255), 
    vision TEXT, 
    primary key (clinic_id)
) engine=InnoDB;

create table doctor_specialty (
    is_primary bit not null, 
    doctor_id bigint, 
    id bigint not null auto_increment, 
    specialty_id bigint, 
    primary key (id)
) engine=InnoDB;

create table doctors (
    years_of_experience integer, 
    user_id bigint not null, 
    bio TEXT, 
    primary key (user_id)
) engine=InnoDB;

create table payments (
    amount float(53) not null, 
    currency varchar(3) not null, 
    retry_count integer not null, 
    appointment_id bigint not null, 
    created_at datetime(6) not null, 
    expired_at datetime(6), 
    paid_at datetime(6), 
    payment_id bigint not null auto_increment, 
    updated_at datetime(6), 
    cancel_url varchar(500), 
    return_url varchar(500), 
    deep_link varchar(1000), 
    payment_url varchar(1000), 
    qr_code varchar(1000), 
    user_agent varchar(1000), 
    callback_data TEXT, 
    client_ip varchar(255), 
    customer_email varchar(255), 
    customer_name varchar(255), 
    customer_phone varchar(255), 
    description varchar(255), 
    device_type varchar(255), 
    error_code varchar(255), 
    error_message varchar(255), 
    gateway_order_id varchar(255), 
    gateway_response TEXT, 
    gateway_transaction_id varchar(255), 
    order_id varchar(255) not null, 
    payment_method enum ('MOMO_ATM','MOMO_CREDIT_CARD','MOMO_WALLET','VNPAY_ATM','VNPAY_BANK_TRANSFER','VNPAY_CREDIT_CARD','VNPAY_QR'), 
    provider enum ('MOMO','VNPAY') not null, 
    status enum ('CANCELLED','EXPIRED','FAILED','PENDING','PROCESSING','REFUNDED','SUCCESS') not null, 
    primary key (payment_id)
) engine=InnoDB;

create table roles (
    role_id bigint not null auto_increment, 
    role_name varchar(255), 
    primary key (role_id)
) engine=InnoDB;

create table specialties (
    clinic_id bigint, 
    specialty_id bigint not null auto_increment, 
    description TEXT, 
    name varchar(255), 
    primary key (specialty_id)
) engine=InnoDB;

create table standard_work_shifts (
    end_time time(6), 
    is_default BOOLEAN DEFAULT FALSE not null, 
    start_time time(6), 
    clinic_id bigint, 
    shift_id bigint not null auto_increment, 
    shift_name varchar(255), 
    day_of_week enum ('FRIDAY','MONDAY','SATURDAY','SUNDAY','THURSDAY','TUESDAY','WEDNESDAY'), 
    primary key (shift_id)
) engine=InnoDB;

create table system_configuration (
    default_deposit_amount decimal(10,2), 
    enable_deposit bit default true not null, 
    enable_momo bit default true not null, 
    enable_vn_pay bit default true not null, 
    examination_fee decimal(10,2), 
    patient_cancellation_time_limit_hours integer, 
    payment_retry_timeout_minutes integer, 
    config_id bigint not null auto_increment, 
    default_payment_method varchar(255), 
    momo_access_key varchar(255), 
    momo_api_endpoint varchar(255), 
    momo_partner_code varchar(255), 
    momo_secret_key varchar(255), 
    non_refundable_deposit_policy TEXT, 
    vnpay_secret_key varchar(255), 
    vnpay_tmn_code varchar(255), 
    primary key (config_id)
) engine=InnoDB;

create table users (
    date_of_birth date, 
    email_notifications_enabled bit not null, 
    is_active bit not null, 
    created_at datetime(6), 
    last_login_at datetime(6), 
    registration_date datetime(6), 
    role_id bigint, 
    user_id bigint not null auto_increment, 
    address varchar(255), 
    clerk_user_id varchar(255), 
    email varchar(255) not null, 
    full_name varchar(255), 
    gender varchar(255), 
    image_url varchar(255), 
    password_hash varchar(255), 
    phone_number varchar(255), 
    primary key (user_id)
) engine=InnoDB;

-- Add constraints (unique keys and foreign keys)
alter table payments add constraint UK8vo36cen604as7etdfwmyjsxt unique (order_id);
alter table roles add constraint UK716hgxp60ym1lifrdgp67xt5k unique (role_name);
alter table users add constraint UK57vrrk8f99m307cjtiyqcprhw unique (clerk_user_id);
alter table users add constraint UK6dotkott2kjsp8vw4d0m25fb7 unique (email);
alter table appointments add constraint FKap2c2dv8qh6r32te6qbakix0b foreign key (clinic_id) references clinics (clinic_id);
alter table appointments add constraint FK6u6s6egu60m2cbdjno44jbipa foreign key (doctor_id) references users (user_id);
alter table appointments add constraint FKopb2h9yhin1rb4dqote8bws6w foreign key (patient_id) references users (user_id);
alter table appointments add constraint FKpcc7t66we73o00qf2s8q634k7 foreign key (slot_id) references availability_slots (slot_id);
alter table appointments add constraint FKhn2k6wtscqwekhug3uj3sljod foreign key (specialty_id) references specialties (specialty_id);
alter table articles add constraint FKe02fs2ut6qqoabfhj325wcjul foreign key (author_id) references users (user_id);
alter table availability_slots add constraint FKqq5d3idovfnrhbdj7lakr1bpp foreign key (clinic_id) references clinics (clinic_id);
alter table availability_slots add constraint FKbpaaliokab639tw3cqbc7nubm foreign key (doctor_id) references doctors (user_id);
alter table availability_slots add constraint FKd7lylmjmtq0botuehhhnl0yjl foreign key (specialty_id) references specialties (specialty_id);
alter table doctor_specialty add constraint FK2hk0t6mjxwnv8y85yd6sj5ktp foreign key (doctor_id) references doctors (user_id);
alter table doctor_specialty add constraint FK4917gxpqbpgy2bl7167thi4xx foreign key (specialty_id) references specialties (specialty_id);
alter table doctors add constraint FKe9pf5qtxxkdyrwibaevo9frtk foreign key (user_id) references users (user_id);
alter table payments add constraint FK9a0odew03qao7nlbdsesrux5u foreign key (appointment_id) references appointments (appointment_id);
alter table specialties add constraint FKm5qwyrqxwvcddbps9725ic0nj foreign key (clinic_id) references clinics (clinic_id);
alter table standard_work_shifts add constraint FKiko19gkb2052gbjxaucn18sbf foreign key (clinic_id) references clinics (clinic_id);
alter table users add constraint FKp56c1712k691lhsyewcssf40f foreign key (role_id) references roles (role_id); 
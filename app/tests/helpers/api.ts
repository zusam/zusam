export type Group = {
  id: string;
  name: string;
  inviteKey?: string;
};

export type User = {
  id: string;
  groups: Group[];
  name: string;
  login: string;
  data: {
    default_group: string;
  }
};

export type CreatedUser = {
  api_key: string;
  group: string;
};

export type LoginResponse = {
  api_key: string;
};

export type Notification = {
  id: string;
  createdAt: number;
  type: "user_joined_group" | string;
  target: string;
  read: boolean;
  data: unknown[];
  fromUser: {
    id: string;
    name: string;
    entityType: "user";
  };
  fromGroup: {
    id: string;
    name: string;
    entityType: "group";
  };
  entityType: "notification";
};

export type Notifications = Notification[];

export type Post = {
  id: string;
  title: string;
  text: string;
  author: string;
  group: string;
};

export type RequestFn = <T>(
  url: string,
  data?: unknown,
  method?: string
) => Promise<T>;

export async function addMessage(
  request: RequestFn,
  params: { meId: string; groupId: string; title: string; content: string }
): Promise<Post> {
  const { meId, groupId, title, content } = params;

  const postData = {
    files: [],
    data: {
      title,
      text: content,
    },
    type: "standard",
    createdAt: Math.floor(Date.now() / 1000),
    author: meId,
    group: groupId,
    children: [],
    lastActivityDate: Math.floor(Date.now() / 1000),
  };

  return request<Post>("/api/messages", postData, "POST");
}

export async function getMe(
  request: RequestFn
): Promise<User> {
  return request<User>("/api/me", undefined, "GET");
}


export async function getGroup(
  request: RequestFn,
  params: { groupId: string }
): Promise<Group> {
  return request<Group>(`/api/groups/${params.groupId}`, undefined, "GET");
}

export async function addUser(
  request: RequestFn,
  params: { login: string; groupId: string }
): Promise<CreatedUser> {
  const groupData = await getGroup(request, { groupId: params.groupId });

  const postData = {
    login: params.login,
    password: "zusam",
    invite_key: groupData.inviteKey,
  };

  return request<CreatedUser>("/api/signup", postData, "POST");
}

export async function addGroup(
  request: RequestFn,
  params: { name: string }
): Promise<Group> {
  const postData = {
    name: params.name,
    createdAt: Math.floor(Date.now() / 1000),
  };

  return request<Group>("/api/groups", postData, "POST");
}

export async function bookmarkMessage(
  request: RequestFn,
  params: { message_id: string }
): Promise<Group> {
  const postData = {
    message_id: params.message_id
  };

  return request<Group>("/api/bookmarks", postData, "POST");
}

export async function getNotifications(
  request: RequestFn
): Promise<Notifications> {
  return request<Notifications>("/api/me/notifications/21", undefined, "GET");
}

export async function logIn(
  request: RequestFn,
  params: { login: string, password: string }
): Promise<LoginResponse> {
  const postData = {
    login: params.login,
    password: params.password
  };

  return request<LoginResponse>("/api/login", postData, "POST");
}
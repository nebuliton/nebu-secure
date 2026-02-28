import {
    queryParams,
    type RouteQueryOptions,
    type RouteDefinition,
    type RouteFormDefinition,
    applyUrlDefaults,
} from './../../wayfinder';
/**
 * @see routes/web.php:13
 * @route '/share/{token}'
 */
export const share = (
    args:
        | { token: string | number }
        | [token: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: share.url(args, options),
    method: 'get',
});

share.definition = {
    methods: ['get', 'head'],
    url: '/share/{token}',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see routes/web.php:13
 * @route '/share/{token}'
 */
share.url = (
    args:
        | { token: string | number }
        | [token: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args };
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        token: args.token,
    };

    return (
        share.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see routes/web.php:13
 * @route '/share/{token}'
 */
share.get = (
    args:
        | { token: string | number }
        | [token: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: share.url(args, options),
    method: 'get',
});
/**
 * @see routes/web.php:13
 * @route '/share/{token}'
 */
share.head = (
    args:
        | { token: string | number }
        | [token: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: share.url(args, options),
    method: 'head',
});

/**
 * @see routes/web.php:13
 * @route '/share/{token}'
 */
const shareForm = (
    args:
        | { token: string | number }
        | [token: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: share.url(args, options),
    method: 'get',
});

/**
 * @see routes/web.php:13
 * @route '/share/{token}'
 */
shareForm.get = (
    args:
        | { token: string | number }
        | [token: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: share.url(args, options),
    method: 'get',
});
/**
 * @see routes/web.php:13
 * @route '/share/{token}'
 */
shareForm.head = (
    args:
        | { token: string | number }
        | [token: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: share.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

share.form = shareForm;
/**
 * @see routes/web.php:44
 * @route '/vault'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});

index.definition = {
    methods: ['get', 'head'],
    url: '/vault',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see routes/web.php:44
 * @route '/vault'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options);
};

/**
 * @see routes/web.php:44
 * @route '/vault'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});
/**
 * @see routes/web.php:44
 * @route '/vault'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
});

/**
 * @see routes/web.php:44
 * @route '/vault'
 */
const indexForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});

/**
 * @see routes/web.php:44
 * @route '/vault'
 */
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});
/**
 * @see routes/web.php:44
 * @route '/vault'
 */
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

index.form = indexForm;
const vault = {
    share: Object.assign(share, share),
    index: Object.assign(index, index),
};

export default vault;

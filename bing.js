// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.228
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["总书记要求正确处理这对关系", "数十架中资公司飞机被扣俄罗斯", "老人强奸未成年却未被收监 法院回应", "多项贷款贴息来了 又将节省一笔钱", "美俄元首将一对一会晤", "手机换菜刀到底行不行？国安部提示", "女子被“风水师”骗936万投湖自杀", "三亚7199元一晚的酒店虫子成群", "厦门4名“假和尚”“假尼姑”被判刑", "立邦漆创始人逝世 曾是新加坡首富", "这6个指标正常说明你还算健康", "特斯拉司机持刀伤人？男子造谣被拘", "男子因女友穿裙子出门对其殴打强奸", "8个子女“踢皮球”拒赡养93岁老父亲", "牛弹琴：韩国又创造了历史", "美股收盘：标普、纳指再创历史新高", "男子带娃看病发现9岁女儿非亲生", "恒大退市 许家印等被追讨超400亿", "导演郑某峰涉嫌猥亵儿童已被批捕", "韩国前第一夫人金建希被拘押", "撞人叫嚣男子系网红 曾合作多地文旅", "30岁女星因家中太乱发文致歉", "“炒菜多放辣椒”成先进事迹引争议", "短剧基地狂飙 谁是下一个横店", "吃鸡蛋事件被质疑是剧本 妇联回应", "手机闪购成交额暴增超300%", "个人单笔5万元以下消费贷可享贴息", "男子家中点火泄愤致母亲死亡", "申淑娟严重违纪违法被“双开”", "台风“杨柳”中心阵风可达15至16级", "四川一便民服务中心工作人员迟到", "医院外请专家做手术被举报乱收费", "玉米阿姨跳海救人后：直播遭黑粉攻击", "一汽丰田高管点名小米汽车算错数", "阿迪达斯就新鞋抄袭道歉", "重庆一爱心冰柜遭老人哄抢 当地回应", "公园湖底发现百余发步枪子弹", "邓紫棋称投资AI公司已赚10倍", "女学员拿刀架脖子讨要学费？警方回应", "馆长抵达深圳感谢粉丝热情接机", "面馆免费加面需餐前说被指虚假宣传", "受害人回应在地铁口遭陌生男子强吻", "加沙5岁男童因饥饿离世体重仅3公斤", "中国游客讲述在巴西深夜乘大巴被劫", "全球首款女团机器人10580元拍出", "泽连斯基：不接受没有乌方参与的决定", "实探8岁走失男童涉事夏令营", "男子雪山失联20天 女友悬赏20万寻人", "丁禹兮为拍戏用手和筷子催吐", "外卖骑手在商场二楼骑车取餐", "特朗普：不想让记者们太舒服"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}

// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.198
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
var default_search_words = ["万物共生 中国主张", "北京密云水库泄洪水都流去哪了", "柬泰停火 两国领导人双双感谢中国", "华北局地强降雨 抢险救援加紧进行", "直击北京暴雨", "霍启刚发文祝贺郭晶晶", "网警：快乐过暑假 安全不“放假”", "北京极端强降雨已致30人遇难", "育儿补贴“含金量”有多高", "女孩高考后昏迷 收到录取通知苏醒", "凌晨洪水来袭 密云大哥挨家敲窗救人", "给留学生配陪读？岭南师范学院回应", "“老头乐”排队上高速 已全部劝返", "鼓励生育需要这样“真金白银”支持", "特朗普的特殊装备首次亮相", "北京暴雨受灾现场画面曝光", "目前北京全市累计转移80332人", "男子拒服兵役被联合惩戒", "密云特大暴雨受灾村民：开门被水冲跑", "杨采钰疑似香港产子", "曝“赵四”刘小光儿子家暴", "王楚钦把世界前十赢了个遍", "北京市郊铁路7月29日全部停运", "密云遇极端暴雨 小区积水淹没一层楼", "中国气象局：北京强降雨30日逐渐减弱", "#暴雨中的北京打工人有多拼#", "女子电动车失踪多日 偷车贼是自己", "华为重夺中国大陆智能手机市场第一", "中国长安汽车集团有限公司成立", "曾策划袭击中国人的武装分子被击毙", "北京密云暴雨 记者雨伞险些被吹飞", "“特朗普将冯德莱恩当早餐吃掉了”", "北京发布暴雨橙色预警", "麻六记就酸辣粉相关问题致歉", "2岁女童患心肌炎去世家人以为是感冒", "泰国和柬埔寨停火协议正式生效", "罗大美生前搭档魏小宝泣不成声", "14岁女生解约MCN被索赔家长发声", "陕西历史博物馆计划4300万换新空调", "育儿补贴来了！3岁前每娃每年3600元", "派出所政委被卷入洪水 喊话先救群众", "因花园太丑纽约华人收2000美元罚款", "团伙漫展门口借“大学生创业”诈骗", "特朗普称自己拒绝了爱泼斯坦邀请", "叶童在西宁高反：微醺的感觉", "基孔肯雅热要做核酸吗", "12岁于子迪世锦赛200混第四", "台风“竹节草”间接影响北方", "波兰战机紧急升空", "北京地铁5号线疑冒烟？客服回应", "防治基孔肯雅热广东集中灭蚊"]

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

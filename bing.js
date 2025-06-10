// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.101
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
var default_search_words = ["让互联网更好造福世界各国人民", "中国的垃圾不够烧了", "女孩漂流遭男子高压水枪攻击致失明", "“超算+量算” 告别算力孤岛时代", "世预赛最后一战！国足vs巴林", "美国抗议者占领特朗普大厦", "网警护航 高考个人信息安全指南来了", "男童吃毒蘑菇去世 曾说爸爸别担心我", "曹颖14岁儿子被赞“最帅星二代”", "全国多个景区为中、高考生送福利", "范志毅陪看解说国足最后一战", "高考生在爆燃事故中遇难？不实", "儿子高考结束 妈妈开始放飞自我", "财政部：适当提高退休人员基本养老金", "婚检查出艾滋医生该不该告知配偶", "俄军动用315架无人机及7枚导弹", "国足若输巴林排名或跌出前100", "明星都开始晒LABUBU了", "腾讯音乐拟12.6亿美元收购喜马拉雅", "甜馨分享父母旧照：不用劝复合啦", "舒淇晒LABUBU哭娃", "杀妻灭子案当事人服刑完毕仍是被告", "任正非在人民日报发声：干就完了", "赵子豪一球硬控全场所有人", "女生高考前去考场被货车撞至病危", "全红婵推荐了单依纯《李白》", "卫星曝光：朝鲜侧翻军舰现身朝俄边境", "洛杉矶街头随处可见防暴弹", "杨坤破防后 山寨明星却更火了", "谢文能两次角球开出界", "薄荷色LABUBU拍出108万天价", "再次合体 董明珠孟羽童同喝一碗汤", "女生高考结束家人定制海报庆祝", "杨采钰晒近照孕肚明显", "女子想转运轻信他人 结果被骗60万", "《长安的荔枝》口碑出圈成黑马喜剧", "湘雅医院实习医生罗帅宇坠亡之谜", "泡泡玛特申请80余枚LABUBU相关商标", "范志毅安慰王大雷不要伤感", "洛杉矶抗议者与联邦政府支持者打斗", "《长安的荔枝》细节还原唐风", "未名湖水卖到近百元 北大：不允许", "葛军回应“葛军出征寸草不生”", "上海浦东原书记朱芝松被双开", "杜淳妻子晒整柜LABUBU", "景甜张彬彬官宣《龙骨焚箱》", "陈梦辟谣“有400亿”传闻：很离谱", "泰副总理回应军官宴请中国“VVVIP”", "俄失联运输机已找到 机上人员均生还", "洛杉矶警方承认局面已失控", "伊朗：若核设施遭以袭击将迅速报复"]

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
